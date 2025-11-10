# Special Offer Form Email Function

This Edge Function handles form submissions from the `/special-offer` page and sends email notifications to `Upgradehomeimp@yahoo.com`.

## Email Configuration

The function sends emails using EmailJS (if configured) or falls back to logging for webhook setup.

### Required Environment Variables

For EmailJS setup (recommended):
- `EMAILJS_SERVICE_ID` - Your EmailJS service ID
- `EMAILJS_TEMPLATE_ID` - Your EmailJS template ID  
- `EMAILJS_PUBLIC_KEY` - Your EmailJS public key

For SMTP credentials (used as fallback/defaults):
- `EMAIL_USER` - Gmail address (default: khamareclarke@gmail.com)
- `EMAIL_PASS` - Gmail app password (default: ovga hgzy rltc ifyh)

### Recipient Email

All form submissions are sent to: **Upgradehomeimp@yahoo.com**

## Form Data Collected

The function collects and sends the following form fields:
- Name (required)
- Phone (required)
- Postcode (required)
- Roof Type (optional)
- Service Needed (optional)
- Same Day Callback (boolean)

## Setup

1. Deploy this function to your Supabase project
2. Set the environment variables in your Supabase project settings
3. Configure EmailJS service to connect to Gmail (if using EmailJS)
4. The function will automatically send emails to `Upgradehomeimp@yahoo.com` when the form is submitted




