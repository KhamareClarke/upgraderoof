import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Gmail SMTP configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'khamareclarke@gmail.com',
        pass: 'ovga hgzy rltc ifyh'.replace(/\s/g, ''), // Remove spaces from app password
      },
    });

    // Format email content
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

    // Send email
    const mailOptions = {
      from: 'khamareclarke@gmail.com',
      to: 'Upgradehomeimp@yahoo.com',
      subject: `New Quote Request - ${formData.service_type} (${formData.name})`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}

