# Email Automation Implementation Guide

## Overview
This guide shows how the SmartHelper application sends automated emails to helpers when their job applications are accepted or rejected using a Make.com webhook.

## Current Implementation

### Backend Flow
1. Family clicks "Accept" or "Reject" on an application
2. Backend fetches helper and job details from database
3. Constructs an email payload with all relevant information
4. Sends POST request to Make.com webhook
5. Make.com processes the webhook and sends formatted email

### Data Sent to Webhook

```json
{
  "helperEmail": "helper@example.com",
  "helperName": "Maria Garcia",
  "familyName": "Smith Family",
  "jobTitle": "Housekeeping",
  "jobLocation": "Downtown, City",
  "jobDate": "2026-01-15",          // Only for accepted
  "jobTime": "09:00",                 // Only for accepted
  "payPerHour": "200",                // Only for accepted
  "status": "accepted",               // or "rejected"
  "subject": "🎉 Application Accepted - Housekeeping",
  "message": "Congratulations! Your application has been accepted..."
}
```

## Email Templates

### 🎉 ACCEPTANCE EMAIL TEMPLATE

**Subject:** 🎉 Application Accepted - Housekeeping

```
┌─────────────────────────────────────────────────────────┐
│  [Purple Gradient Header]                               │
│  🎉 Congratulations!                                     │
│  Your Application Has Been Accepted                     │
└─────────────────────────────────────────────────────────┘

Hi Maria,

Congratulations! Your application has been accepted for the job 
"Housekeeping". Looking forward to working with you!

┌─────────────────────────────────────────────────────────┐
│  Job Details:                                           │
│                                                         │
│  Family: Smith Family                                   │
│  Job Title: Housekeeping                                │
│  Location: Downtown, City                               │
│  Date: 2026-01-15                                       │
│  Time: 09:00                                            │
│  Rate: Rs 200/hour                                      │
└─────────────────────────────────────────────────────────┘

Please check the SmartHelper app for more details and to 
confirm your availability.

[Footer]
SmartHelper © 2026 | All Rights Reserved
```

### ❌ REJECTION EMAIL TEMPLATE

**Subject:** Application Status Update - Housekeeping

```
┌─────────────────────────────────────────────────────────┐
│  [Red/Pink Gradient Header]                             │
│  Application Update                                     │
│  We've Made a Decision                                  │
└─────────────────────────────────────────────────────────┘

Hi Maria,

Thank you for your interest in the "Housekeeping" job. 
Unfortunately, the family has selected another helper for 
this position. Keep applying - there are more opportunities 
ahead!

┌─────────────────────────────────────────────────────────┐
│  About the Job:                                         │
│                                                         │
│  Family: Smith Family                                   │
│  Job Title: Housekeeping                                │
│  Location: Downtown, City                               │
└─────────────────────────────────────────────────────────┘

💡 Don't worry! There are many more job opportunities 
available. Keep applying and improving your profile!

[Footer]
SmartHelper © 2026 | All Rights Reserved
```

## Make.com Setup Steps

### 1. Create Webhook Trigger
- In Make.com, create new scenario
- Add "Webhooks" → "Custom Webhook" module
- Copy the generated webhook URL
- Paste it in backend code (already done ✓)

### 2. Add Email Module
- Add "Gmail" or preferred email service
- Connect your notification email account
- To field: `{{payload.helperEmail}}`
- From field: Use your configured notification email

### 3. Conditional Routing (Optional)
Use Router to send different emails based on status:

```
IF {{payload.status}} == "accepted"
  → Send ACCEPTANCE email
  
ELSE IF {{payload.status}} == "rejected"
  → Send REJECTION email
```

### 4. Email Body Configuration

**For Accepted Applications:**
```html
<div style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
  <h1>🎉 Congratulations!</h1>
  <p>Your Application Has Been Accepted</p>
</div>

<div style="background: #f8f9fa; padding: 30px;">
  <p>Hi {{payload.helperName}},</p>
  <p>{{payload.message}}</p>
  
  <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
    <h3>Job Details:</h3>
    <p>
      <strong>Family:</strong> {{payload.familyName}}<br>
      <strong>Job Title:</strong> {{payload.jobTitle}}<br>
      <strong>Location:</strong> {{payload.jobLocation}}<br>
      <strong>Date:</strong> {{payload.jobDate}}<br>
      <strong>Time:</strong> {{payload.jobTime}}<br>
      <strong>Rate:</strong> Rs {{payload.payPerHour}}/hour
    </p>
  </div>
  
  <p style="text-align: center;">
    Please check the SmartHelper app for more details and to confirm your availability.
  </p>
</div>
```

**For Rejected Applications:**
```html
<div style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
  <h1>Application Update</h1>
  <p>We've Made a Decision</p>
</div>

<div style="background: #f8f9fa; padding: 30px;">
  <p>Hi {{payload.helperName}},</p>
  <p>{{payload.message}}</p>
  
  <div style="background: white; border-left: 4px solid #f5576c; padding: 20px; margin: 20px 0;">
    <h3>About the Job:</h3>
    <p>
      <strong>Family:</strong> {{payload.familyName}}<br>
      <strong>Job Title:</strong> {{payload.jobTitle}}<br>
      <strong>Location:</strong> {{payload.jobLocation}}
    </p>
  </div>
  
  <p style="background: #fff3cd; padding: 15px; border-radius: 5px; text-align: center;">
    💡 Don't worry! There are many more job opportunities available. Keep applying and improving your profile!
  </p>
</div>
```

## Key Features

✅ **Dynamic Content**: All variables are merged from the database
✅ **Professional Design**: Gradient headers and organized layout
✅ **Responsive**: Works on mobile and desktop clients
✅ **Status-Specific**: Different messages for accepted vs rejected
✅ **Context-Rich**: Includes all job details helper needs
✅ **Encouraging Tone**: Rejection email still motivates helpers
✅ **Error Handling**: Webhook failures don't break the app flow

## Testing

1. Run the backend server
2. In frontend, post a job as family user
3. Apply for that job as helper user
4. Accept/Reject the application
5. Check helper's email for the notification

## Variables Reference

| Variable | Description | Acceptance | Rejection |
|----------|-------------|-----------|-----------|
| helperEmail | Recipient email | ✓ | ✓ |
| helperName | Helper's name | ✓ | ✓ |
| familyName | Family's name | ✓ | ✓ |
| jobTitle | Job title | ✓ | ✓ |
| jobLocation | Job location | ✓ | ✓ |
| jobDate | Job date | ✓ | ✗ |
| jobTime | Job time | ✓ | ✗ |
| payPerHour | Pay rate | ✓ | ✗ |
| status | acceptance status | ✓ | ✓ |
| subject | Email subject | ✓ | ✓ |
| message | Body message | ✓ | ✓ |

## Troubleshooting

**Email not received?**
- Check Make.com webhook logs
- Verify email account is connected
- Ensure webhook URL is correct in backend

**Wrong recipient?**
- Verify helper email is stored correctly in database
- Check SQL query in accept/reject endpoints

**Formatting issues?**
- Test HTML in Make.com email preview
- Check that all {{payload.*}} variables are available
- Some email clients strip CSS - use inline styles

## Future Enhancements

- Add SMS notifications
- Send email to family confirming assignment
- Add helper feedback/survey link in rejection email
- Schedule reminder emails before job date
- Include payment details and banking info in acceptance email
