import { NextRequest, NextResponse } from 'next/server';
import { emitFleetIngest } from '@/lib/fleet-ingest';
import { pushLeadToGhl } from '@/lib/ghl';
import { getMailConfig, mailErrorResponseMessage } from '@/lib/mail';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const ghlOpps = require('@/lib/ghl/opportunities.js');

/**
 * After the contact lands in GHL, open a sales-pipeline opportunity for it
 * (first pipeline + first stage) so the lead is tracked through the funnel.
 * Non-blocking — failures are logged, never fatal to the lead.
 */
async function createOpportunityForContact(contactId: string | null, name: string) {
  if (!contactId) return;
  try {
    const { pipelines } = await ghlOpps.listPipelines();
    const first = pipelines[0];
    const firstStage = first && first.stages && first.stages[0];
    if (!first || !firstStage) return; // no pipeline configured yet
    await ghlOpps.createOpportunity({
      contactId,
      name: `${name} — Website Lead`,
      pipelineId: first.id,
      stageId: firstStage.id,
      status: 'open',
    });
  } catch (err) {
    console.warn('[ghl] opportunity create error:', err);
  }
  // Fire speed-to-lead (instant SMS/call) for the new lead. Non-blocking.
  ghlOpps.triggerSpeedToLead(contactId, { source: 'contact_form' })
    .then((r: any) => { if (!r.triggered) console.log('[ghl] speed-to-lead not triggered:', r.reason); })
    .catch((err: any) => console.warn('[ghl] speed-to-lead error:', err));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Honeypot check — if filled, silently return success to trick bots
    if (formData.website) {
      console.log('[spam] Honeypot triggered for contact form');
      return NextResponse.json(
        { success: true, message: 'Message received' },
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

    if (!formData?.name || !formData?.email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required.' },
        { status: 400 }
      );
    }

    await emitFleetIngest({
      event_type: 'lead',
      summary: `Contact form: ${formData.name} (${formData.email}) — ${formData.subject || 'no subject'}`,
      payload: { name: formData.name, email: formData.email, subject: formData.subject },
    });

    // Push the lead into GHL. Awaited so the serverless runtime doesn't freeze
    // the in-flight request when the response returns — pushLeadToGhl never
    // throws, so a GHL outage still can't lose the lead.
    const ghlContactId = await pushLeadToGhl({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      gclid: formData.gclid,
      tags: ['website-lead', 'contact-form', ...(formData.gclid ? ['google-ads-lead'] : [])],
      source: 'contact_form',
      notes: `Subject: ${formData.subject || 'n/a'}\n\n${formData.message || ''}`,
    });
    createOpportunityForContact(ghlContactId, formData.name)
      .catch(err => console.warn('[ghl] contact follow-up error:', err));

    try {
      const { transporter, from, to } = getMailConfig();

      const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        ${formData.phone ? `<p><strong>Phone:</strong> ${formData.phone}</p>` : ''}
        <p><strong>Subject:</strong> ${formData.subject}</p>
        <p><strong>Message:</strong></p>
        <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${formData.message}</p>
      </div>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">
        This form was submitted from the Contact page.
      </p>
    `;

      await transporter.sendMail({
        from,
        to,
        subject: `New Contact Form Submission - ${formData.subject} (${formData.name})`,
        html: emailHtml,
      });
    } catch (mailErr: unknown) {
      console.error('Contact mail failed after JARVIS notify:', mailErr);
      return NextResponse.json(
        {
          success: true,
          message: 'Message received (email delivery pending)',
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
    console.error('Error sending contact:', error);
    return NextResponse.json(
      { success: false, error: mailErrorResponseMessage(error) },
      { status: 500 }
    );
  }
}
