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

interface QuoteRequest {
  name: string;
  email: string;
  phone: string;
  postcode: string;
  service_type: string;
  message?: string;
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

    const data: QuoteRequest = await req.json();

    // Save to database
    const { error: dbError } = await supabase
      .from('quote_requests')
      .insert([data]);

    if (dbError) throw dbError;

    // Send email notification to owner
    const recipientEmail = Deno.env.get('EMAIL_USER') || 'khamareclarke@gmail.com';
    const emailUser = Deno.env.get('EMAIL_USER') || 'khamareclarke@gmail.com';
    const emailPass = Deno.env.get('EMAIL_PASS') || '';

    try {
      // Send email notification to owner using Gmail SMTP
      const emailHtml = `
        <h2>New Quote Request</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Postcode:</strong> ${data.postcode}</p>
        <p><strong>Service:</strong> ${data.service_type}</p>
        ${data.message ? `<p><strong>Message:</strong></p><p>${data.message}</p>` : ''}
      `;

      await sendEmailViaSMTP(
        emailUser,
        emailPass,
        recipientEmail,
        `New Quote Request: ${data.service_type}`,
        emailHtml
      );
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails - data is already saved
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Quote request submitted successfully' }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing quote request:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
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