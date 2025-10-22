# Contact Form Submission System

This document explains the contact form submission system implemented in the About page.

## Overview

The contact form on the About page (`/app/about/page.tsx`) now captures submissions and saves them to a text file for record-keeping purposes.

## Files Modified/Created

### 1. `/app/api/contact-form/route.ts`
- **Purpose**: API endpoint to handle contact form submissions
- **Method**: POST
- **Functionality**:
  - Validates required fields (firstName, lastName, email, subject, message)
  - Creates timestamp for each submission
  - Formats submission data consistently
  - Appends submissions to the text file
  - Returns success/error responses

### 2. `/app/about/page.tsx`
- **Changes**: Added form state management and submission handling
- **New Features**:
  - React state for form data
  - Form validation
  - Loading states during submission
  - Success/error message display
  - Form reset after successful submission

### 3. `/data/contact-submissions.txt`
- **Purpose**: Text file to store all contact form submissions
- **Format**: Each submission includes:
  - Submission timestamp
  - Full name (firstName + lastName)
  - Email address
  - Company name (if provided)
  - Subject line
  - Full message content
  - Separator lines for easy reading

## Form Fields

### Required Fields
- **First Name**: User's first name
- **Last Name**: User's last name
- **Email**: Contact email address
- **Subject**: Brief subject line
- **Message**: Detailed message content

### Optional Fields
- **Company**: Company name (marked as "Not provided" if empty)

## Data Storage Format

Each submission is stored in the following format:

```
=====================================
Submission Date: 2025-10-22T10:30:00.000Z
Name: John Doe
Email: john.doe@example.com
Company: Example Corp
Subject: Inquiry about software features
Message: I would like to know more about the fleet management features...
=====================================
```

## API Endpoint Details

### URL: `/api/contact-form`
### Method: `POST`
### Content-Type: `application/json`

#### Request Body:
```json
{
  "firstName": "string",
  "lastName": "string", 
  "email": "string",
  "company": "string (optional)",
  "subject": "string",
  "message": "string"
}
```

#### Success Response (200):
```json
{
  "success": true,
  "message": "Contact form submitted successfully"
}
```

#### Error Response (400/500):
```json
{
  "error": "Error description"
}
```

## Security Considerations

1. **Input Validation**: All required fields are validated on both client and server side
2. **File Safety**: Uses Node.js `fs.promises` for safe file operations
3. **Error Handling**: Comprehensive error handling for file operations and validation
4. **Directory Creation**: Automatically creates the data directory if it doesn't exist

## File Location

All contact submissions are stored at:
```
C:\Users\Gayan\Desktop\fleetiq\data\contact-submissions.txt
```

## Usage

1. **User Experience**: Users fill out the contact form on the About page
2. **Submission**: Form data is sent to the API endpoint
3. **Processing**: Server validates data and appends to text file
4. **Feedback**: User receives confirmation or error message
5. **Storage**: Admin can review submissions in the text file

## Monitoring Submissions

To view all contact submissions:

1. Navigate to `C:\Users\Gayan\Desktop\fleetiq\data\contact-submissions.txt`
2. Open the file in any text editor
3. Each submission is clearly separated and timestamped
4. Search for specific emails or dates as needed

## Future Enhancements

Consider these improvements for the future:

1. **Database Storage**: Move from text file to database for better querying
2. **Email Notifications**: Send email alerts when new submissions arrive
3. **Admin Dashboard**: Create an admin interface to view and manage submissions
4. **Export Features**: Add CSV/Excel export functionality
5. **Spam Protection**: Implement CAPTCHA or rate limiting
6. **File Rotation**: Implement log rotation for large files

The current implementation provides a simple, reliable way to capture and store contact form submissions while maintaining data integrity and providing good user experience.