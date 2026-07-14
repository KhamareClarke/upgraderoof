import { NextRequest, NextResponse } from 'next/server';
import { emitFleetIngest } from '@/lib/fleet-ingest';
import { getMailConfig, mailErrorResponseMessage } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    if (!formData?.name || !formData?.email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required.' },
        { status: 400 }
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
      },
    });

    try {
      const { transporter, from, to } = getMailConfig();

      const emailHtml = `
      <h2>New Quote Request</h2>
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Phone:</strong> ${formData.phone}</p>
        <p><strong>Postcode:</strong> ${formData.postcode}</p>
        <p><strong>Service Type:</strong> ${formData.service_type}</p>
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
        subject: `New Quote Request - ${formData.service_type} (${formData.name})`,
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
