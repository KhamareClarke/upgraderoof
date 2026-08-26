import { NextRequest, NextResponse } from 'next/server';
import { emitFleetIngest } from '@/lib/fleet-ingest';
import { pushLeadToGhl } from '@/lib/ghl';
import { getMailConfig, mailErrorResponseMessage } from '@/lib/mail';
import { checkRateLimit, getClientIp, isTooFast } from '@/lib/rate-limit';
import { invalidNameReason, invalidPhoneReason, invalidPostcodeReason, invalidEmailReason } from '@/lib/lead-validation';
import { verifyTurnstile } from '@/lib/turnstile';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Honeypot check — if filled, silently return success to trick bots
    if (formData.website) {
      console.log('[spam] Honeypot triggered for quote form');
      return NextResponse.json(
        { success: true, message: 'Quote request received' },
        { status: 200 }
      );
    }

    // Rate limiting — max 3 submissions per IP per hour
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp, 3, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      console.log(`[spam] Rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    if (!formData?.name || !formData?.phone || !formData?.postcode) {
      return NextResponse.json(
        { success: false, error: 'Name, phone and postcode are required.' },
        { status: 400 }
      );
    }

    // Timing heuristic — reject a repeat submission from the same identity
    // arriving faster than a human can re-read and re-submit (retry/scripted
    // bots). Fake success so bots can't tell they've been filtered.
    if (isTooFast(clientIp, 3)) {
      console.log(`[spam] quote lead too fast from ${clientIp}`);
      return NextResponse.json(
        { success: true, message: 'Quote request received' },
        { status: 200 }
      );
    }

    // Turnstile — env-gated. A configured gate rejects invalid/missing tokens;
    // an unconfigured one passes everyone through. When the gate is on and the
    // token fails, return a hard 400 (bot should give up), not a fake success.
    const turnstile = await verifyTurnstile(formData.turnstileToken);
    if (!turnstile.ok) {
      console.log(`[spam] quote lead failed turnstile (${turnstile.reason}) from ${clientIp}`);
      return NextResponse.json(
        { success: false, error: 'CAPTCHA verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // Content validation — reject junk leads the honeypot + rate limit let
    // through. Return a fake success so bots can't tell they've been filtered.
    const spamReasons = [
      invalidNameReason(formData.name),
      invalidPhoneReason(formData.phone),
      invalidPostcodeReason(formData.postcode),
      ...(formData.email ? [invalidEmailReason(formData.email)] : []),
    ].filter(Boolean);
    if (spamReasons.length > 0) {
      console.log(`[spam] quote lead rejected (${spamReasons.join('; ')}) — name="${formData.name}" phone="${formData.phone}" postcode="${formData.postcode}"`);
      return NextResponse.json(
        { success: true, message: 'Quote request received' },
        { status: 200 }
      );
    }

    // Await so Vercel does not kill the fetch before JARVIS receives it.
    await emitFleetIngest({
      event_type: 'lead',
      summary: `Quote request: ${formData.name} (${formData.email}) — ${formData.service_type || 'n/a'} (${formData.postcode || 'n/a'})`,
      payload: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        postcode: formData.postcode,
        service_type: formData.service_type,
        roof_type: formData.roof_type,
        message: formData.message,
      },
    });

    // Push the lead into GHL. Awaited so the serverless runtime doesn't freeze
    // the in-flight request — pushLeadToGhl never throws, so a GHL outage
    // still can't lose the lead.
    await pushLeadToGhl({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      postcode: formData.postcode,
      gclid: formData.gclid,
      tags: ['website-lead', 'cheshire-roof-quote', ...(formData.gclid ? ['google-ads-lead'] : [])],
      source: 'quote_form',
      notes: `Service: ${formData.service_type || 'n/a'}\nRoof type: ${formData.roof_type || 'n/a'}\n\n${formData.message || ''}`,
      customFields: {
        ...(formData.service_type ? { service_type: formData.service_type } : {}),
        ...(formData.roof_type ? { roof_type: formData.roof_type } : {}),
      },
    });

    try {
      const { transporter, from, to } = getMailConfig();

      const emailHtml = `
      <h2>New Quote Request</h2>
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p><strong>Name:</strong> ${formData.name}</p>
        ${formData.email ? `<p><strong>Email:</strong> ${formData.email}</p>` : ''}
        <p><strong>Phone:</strong> ${formData.phone}</p>
        <p><strong>Postcode:</strong> ${formData.postcode}</p>
        ${formData.service_type ? `<p><strong>Service Type:</strong> ${formData.service_type}</p>` : ''}
        ${formData.roof_type ? `<p><strong>Roof Type:</strong> ${formData.roof_type}</p>` : ''}
        ${formData.message ? `<p><strong>Additional Details:</strong></p><p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${formData.message}</p>` : ''}
      </div>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">
        This quote request was submitted from the website.
      </p>
    `;

      await transporter.sendMail({
        from,
        to,
        subject: `New Quote Request - ${formData.service_type || 'Free Inspection'} (${formData.name})`,
        html: emailHtml,
      });
    } catch (mailErr: unknown) {
      // JARVIS already notified — still return success so the lead is not lost in-app.
      console.error('Quote mail failed after JARVIS notify:', mailErr);
      return NextResponse.json(
        {
          success: true,
          message: 'Quote received (email delivery pending)',
          email_error: mailErrorResponseMessage(mailErr),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error sending quote:', error);
    return NextResponse.json(
      { success: false, error: mailErrorResponseMessage(error) },
      { status: 500 }
    );
  }
}
