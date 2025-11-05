# Email Configuration

To enable email notifications when quote requests are submitted:

1. Set these environment variables in your Supabase project:
   - `EMAIL_USER=khamareclarke@gmail.com`
   - `EMAIL_PASS=ovga hgzy rltc ifyh`

2. The email function will automatically send notifications to `khamareclarke@gmail.com` when:
   - A new quote request is submitted
   - A new contact form is submitted

## Alternative: Use EmailJS (Recommended for Edge Functions)

For better reliability with Supabase Edge Functions, consider using EmailJS:

1. Sign up at https://www.emailjs.com
2. Connect your Gmail account
3. Set environment variable: `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`
4. Update the sendEmailViaSMTP function to use EmailJS API

