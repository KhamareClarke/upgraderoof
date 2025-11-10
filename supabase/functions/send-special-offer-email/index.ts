import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// Function to send email - uses EmailJS if available, otherwise logs for webhook
async function sendEmailViaSMTP(
  user: string,
  pass: string,
  to: string,
  subject: string,
  html: string
) {
  const emailjsServiceId = Deno.env.get('EMAILJS_SERVICE_ID');
  const emailjsTemplateId = Deno.env.get('EMAILJS_TEMPLATE_ID');
  const emailjsPublicKey = Deno.env.get('EMAILJS_PUBLIC_KEY');

  // Try EmailJS first (recommended for Edge Functions)
  if (emailjsServiceId && emailjsTemplateId && emailjsPublicKey) {
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: emailjsServiceId,
          template_id: emailjsTemplateId,
          user_id: emailjsPublicKey,
          template_params: {
            to_email: to,
            to_name: 'Upgrade Roofing Solutions',
            from_email: user,
            subject: subject,
            message_html: html,
            message_text: html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim(),
          },
        }),
      });

      if (response.ok) {
        console.log('Email sent successfully via EmailJS');
        return;
      } else {
        throw new Error(`EmailJS error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('EmailJS failed, falling back to webhook:', error);
    }
  }

  // Fallback: Log for webhook/trigger
  // Set up a Supabase database webhook to send emails when records are inserted
  console.log(`📧 Email notification ready:
    To: ${to}
    From: ${user}
    Subject: ${subject}
    HTML: ${html.substring(0, 200)}...
  `);
  
  // Note: For production, set up a Supabase webhook that triggers on insert
  // The webhook can call a separate email service endpoint
}

interface SpecialOfferRequest {
  name: string;
  phone: string;
  postcode: string;
  roofType?: string;
  serviceNeeded?: string;
  sameDayCallback?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const data: SpecialOfferRequest = await req.json();

    // Send email notification to Upgradehomeimp@yahoo.com
    const recipientEmail = 'Upgradehomeimp@yahoo.com';
    const emailUser = Deno.env.get('EMAIL_USER') || 'khamareclarke@gmail.com';
    const emailPass = Deno.env.get('EMAIL_PASS') || 'ovga hgzy rltc ifyh'.replace(/\s/g, '');

    try {
      // Format email content with all form data
      const emailHtml = `
        <h2>New Special Offer Form Submission</h2>
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Postcode:</strong> ${data.postcode}</p>
          ${data.roofType ? `<p><strong>Roof Type:</strong> ${data.roofType}</p>` : ''}
          ${data.serviceNeeded ? `<p><strong>Service Needed:</strong> ${data.serviceNeeded}</p>` : ''}
          <p><strong>Same Day Callback Requested:</strong> ${data.sameDayCallback ? 'Yes' : 'No'}</p>
        </div>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          This form was submitted from the Special Offer page.
        </p>
      `;

      await sendEmailViaSMTP(
        emailUser,
        emailPass,
        recipientEmail,
        `New Special Offer Form Submission - ${data.name}`,
        emailHtml
      );
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Form submitted successfully' }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error processing special offer form:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'An error occurred' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

