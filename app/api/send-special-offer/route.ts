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

    // Send email
    const mailOptions = {
      from: 'khamareclarke@gmail.com',
      to: 'Upgradehomeimp@yahoo.com',
      subject: `New Special Offer Form Submission - ${formData.name}`,
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

