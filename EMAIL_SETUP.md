# Contact Form Data Saving

The contact form popup is now implemented and ready to use. Currently, the API endpoint (`/api/send-contact-email`) saves all form submissions to a text file located at `data/contact-submissions.txt` in the project root.

## Current Implementation

All contact form submissions are automatically saved to:
```
data/contact-submissions.txt
```

Each submission includes:
- Timestamp of submission
- Software name that was clicked
- User's name, email, and contact number
- Source tracking (FleetIQ Website - Software Card Click)

## File Format

The saved data follows this format:
```
=====================================
CONTACT FORM SUBMISSION
=====================================
Timestamp: 10/16/2025, 6:30:00 PM
Software Interest: AiRentoSoft
Name: John Doe
Email: john@example.com
Contact Number: +1-555-123-4567
Source: FleetIQ Website - Software Card Click
=====================================
```

## Converting to Email (Future Implementation)

To enable actual email sending in production, follow these steps:

## Option 1: Using Resend (Recommended)

1. Install Resend:
```bash
npm install resend
```

2. Get your API key from https://resend.com

3. Add to your `.env.local`:
```env
RESEND_API_KEY=your_resend_api_key_here
```

4. Update `app/api/send-contact-email/route.ts`:
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Replace the TODO section with:
await resend.emails.send({
  from: 'noreply@yourdomain.com', // Must be verified domain
  to: 'umesh@airentosoft.com',
  subject: emailContent.subject,
  html: emailContent.html,
})
```

## Option 2: Using SendGrid

1. Install SendGrid:
```bash
npm install @sendgrid/mail
```

2. Get your API key from https://sendgrid.com

3. Add to your `.env.local`:
```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

4. Update `app/api/send-contact-email/route.ts`:
```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

// Replace the TODO section with:
await sgMail.send({
  to: 'umesh@airentosoft.com',
  from: 'noreply@yourdomain.com', // Must be verified
  subject: emailContent.subject,
  html: emailContent.html,
})
```

## Option 3: Using Nodemailer with SMTP

1. Install Nodemailer:
```bash
npm install nodemailer @types/nodemailer
```

2. Add SMTP credentials to `.env.local`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

3. Update `app/api/send-contact-email/route.ts`:
```typescript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT!),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Replace the TODO section with:
await transporter.sendMail({
  from: process.env.SMTP_USER,
  to: 'umesh@airentosoft.com',
  subject: emailContent.subject,
  html: emailContent.html,
})
```

## Current Implementation

Currently implemented features:
- ✅ Beautiful popup modal with form validation
- ✅ Contact form with name, email, and phone number fields
- ✅ Proper error handling and success messages
- ✅ API endpoint that receives and validates form data
- ✅ Email content formatting (HTML and text versions)
- ✅ Integration with all software cards on the homepage
- ✅ Responsive design and smooth animations
- ✅ Form validation and loading states

## Testing

To test the current implementation:
1. Click on any software card on the homepage
2. Fill out the contact form
3. Check the server console to see the formatted email content
4. The form will show success message after submission

## Production Checklist

Before deploying to production:
- [ ] Choose and configure an email service (Resend recommended)
- [ ] Set up environment variables
- [ ] Test email sending in development
- [ ] Verify sender domain/email address
- [ ] Update the API endpoint with actual email sending code
- [ ] Test the complete flow in production environment