import { NextRequest, NextResponse } from 'next/server';
import { emitFleetIngest } from '@/lib/fleet-ingest';
import { getMailConfig, mailErrorResponseMessage } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    if (!formData?.name || !formData?.phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required.' },
        { status: 400 }
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
