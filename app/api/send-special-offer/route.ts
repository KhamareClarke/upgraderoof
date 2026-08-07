import { NextRequest, NextResponse } from 'next/server';
import { emitFleetIngest } from '@/lib/fleet-ingest';
import { pushLeadToGhl } from '@/lib/ghl';
import { invalidSubmissionTimingReason, validateLead } from '@/lib/lead-validation';
import { getMailConfig, mailErrorResponseMessage } from '@/lib/mail';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const ghlOpps = require('@/lib/ghl/opportunities.js');

/**
 * After the contact lands in GHL: open a pipeline opportunity and fire the
 * speed-to-lead workflow (instant SMS/call). Non-blocking — never fatal.
 */
async function postLeadFollowUp(contactId: string | null, name: string) {
  if (!contactId) return;
  try {
    const { pipelines } = await ghlOpps.listPipelines();
    const first = pipelines[0];
    const firstStage = first && first.stages && first.stages[0];
    if (first && firstStage) {
      await ghlOpps.createOpportunity({
        contactId,
        name: `${name} — Special Offer`,
        pipelineId: first.id,
        stageId: firstStage.id,
        status: 'open',
      });
    }
  } catch (err) {
    console.warn('[ghl] opportunity create error:', err);
  }
  ghlOpps.triggerSpeedToLead(contactId, { source: 'special_offer' })
    .then((r: any) => { if (!r.triggered) console.log('[ghl] speed-to-lead not triggered:', r.reason); })
    .catch((err: any) => console.warn('[ghl] speed-to-lead error:', err));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Honeypot check — if filled, silently return success to trick bots
    if (formData.website) {
      console.log('[spam] Honeypot triggered for special offer form');
      return NextResponse.json(
        { success: true, message: 'Special offer request received' },
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

    if (!formData?.name || !formData?.phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required.' },
        { status: 400 }
      );
    }

    // Content validation — reject junk leads (gibberish names, non-UK phones,
    // invalid postcodes) that the honeypot and IP rate limit let through.
    // Return a fake success so bots can't tell they've been filtered.
    const spamReasons = validateLead(formData);
    const timingReason = invalidSubmissionTimingReason(formData);
    const allReasons = timingReason ? [...spamReasons, timingReason] : spamReasons;
    if (allReasons.length > 0) {
      console.log(`[spam] special-offer lead rejected (${allReasons.join('; ')}) — name="${formData.name}" phone="${formData.phone}" postcode="${formData.postcode || ''}"`);
      return NextResponse.json(
        { success: true, message: 'Special offer request received' },
        { status: 200 }
      );
    }

    await emitFleetIngest({
      event_type: 'lead',
      summary: `Special offer: ${formData.name} (${formData.phone}) — ${formData.postcode || 'n/a'}`,
      payload: {
        name: formData.name,
        phone: formData.phone,
        postcode: formData.postcode,
        roofType: formData.roofType,
        serviceNeeded: formData.serviceNeeded,
        sameDayCallback: formData.sameDayCallback,
      },
    });

    // Push the lead into GHL. Awaited so the serverless runtime doesn't freeze
    // the in-flight request when the response returns — pushLeadToGhl never
    // throws, so a GHL outage still can't lose the lead. The opportunity +
    // speed-to-lead follow-up stays fire-and-forget (secondary).
    const ghlContactId = await pushLeadToGhl({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      postcode: formData.postcode,
      gclid: formData.gclid,
      tags: ['website-lead', 'special-offer', ...(formData.gclid ? ['google-ads-lead'] : [])],
      source: 'special_offer',
      notes: `Service needed: ${formData.serviceNeeded || 'n/a'}\nRoof type: ${formData.roofType || 'n/a'}\nSame-day callback: ${formData.sameDayCallback ? 'Yes' : 'No'}`,
      customFields: {
        ...(formData.roofType ? { roof_type: formData.roofType } : {}),
        ...(formData.serviceNeeded ? { service_needed: formData.serviceNeeded } : {}),
      },
    });
    postLeadFollowUp(ghlContactId, formData.name)
      .catch(err => console.warn('[ghl] special-offer follow-up error:', err));

    try {
      const { transporter, from, to } = getMailConfig();

      const emailHtml = `
      <h2>New Special Offer Form Submission</h2>
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Phone:</strong> ${formData.phone}</p>
        <p><strong>Postcode:</strong> ${formData.postcode}</p>
        ${formData.roofType ? `<p><strong>Roof Type:</strong> ${formData.roofType}</p>` : ''}
        ${formData.serviceNeeded ? `<p><strong>Service Needed:</strong> ${formData.serviceNeeded}</p>` : ''}
        <p><strong>Same Day Callback Requested:</strong> ${formData.sameDayCallback ? 'Yes' : 'No'}</p>
      </div>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">
        This form was submitted from the Special Offer page.
      </p>
    `;

      await transporter.sendMail({
        from,
        to,
        subject: `New Special Offer Form Submission - ${formData.name}`,
        html: emailHtml,
      });
    } catch (mailErr: unknown) {
      console.error('Special-offer mail failed after JARVIS notify:', mailErr);
      return NextResponse.json(
        {
          success: true,
          message: 'Lead received (email delivery pending)',
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
    console.error('Error sending special offer:', error);
    return NextResponse.json(
      { success: false, error: mailErrorResponseMessage(error) },
      { status: 500 }
    );
  }
}
