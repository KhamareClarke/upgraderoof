import { NextRequest, NextResponse } from 'next/server';
import { emitFleetIngest } from '@/lib/fleet-ingest';
import { getMailConfig, mailErrorResponseMessage } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    const { transporter, from, to } = getMailConfig();

    // Format email content
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

    void emitFleetIngest({
      event_type: 'lead',
      summary: `Contact form: ${formData.name} (${formData.email}) — ${formData.subject}`,
      payload: { name: formData.name, email: formData.email, subject: formData.subject },
    });

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: mailErrorResponseMessage(error) },
      { status: 500 }
    );
  }
}


