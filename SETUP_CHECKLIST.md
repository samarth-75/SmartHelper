# 📧 SmartHelper Email Automation - Quick Setup Checklist

## ✅ Backend Implementation (Already Done)

- [x] Updated `/applications/:id/accept` endpoint to send webhook
- [x] Updated `/applications/:id/reject` endpoint to send webhook
- [x] Fetches all required data (helper email, name, job details, etc.)
- [x] Sends to Make.com webhook on every accept/reject action
- [x] Error handling (webhook failures don't break app flow)

**Data sent to webhook includes:**
- Helper email address
- Helper name
- Family name
- Job title, location, date, time
- Pay rate (for accepted only)
- Status (accepted/rejected)
- Subject line
- Detailed message

---

## 🔧 Make.com Configuration (Setup Required)

### Step 1: Create Webhook in Make.com
1. Go to [make.com](https://www.make.com)
2. Create a new Scenario: "SmartHelper - Application Notifications"
3. Search for "Webhooks" module
4. Choose "Custom Webhook"
5. Click "Save"
6. **Copy the generated webhook URL**
7. ✅ Already pasted in `backend/routes/applicationRoutes.js`

### Step 2: Add Email Module
1. Add "Gmail" module (or your email provider)
2. Authenticate your email account (use a notification email like noreply@smarthelper.com)
3. Click "Add" to continue

### Step 3: Configure Email Fields

#### For Gmail Module:
- **To:** `{{payload.helperEmail}}`
- **Subject:** `{{payload.subject}}`
- **Body:** Use HTML template (see below)
- **Enable HTML:** Yes

### Step 4: Add Conditional Router (Recommended)

Instead of one email module, use a Router to send different templates:

```
Route 1: If {{payload.status}} == "accepted"
  → Use ACCEPTANCE email template

Route 2: If {{payload.status}} == "rejected"
  → Use REJECTION email template
```

### Step 5: Email Body Templates

**Option A: Use provided HTML templates**
- Copy content from `EMAIL_TEMPLATES.html` file
- Paste into Make.com email body field
- Variables like `{{payload.helperName}}` will auto-fill

**Option B: Simple Text Email**
```
Hi {{payload.helperName}},

{{payload.message}}

Job Details:
Family: {{payload.familyName}}
Job: {{payload.jobTitle}}
Location: {{payload.jobLocation}}

Status: {{payload.status}}

Best regards,
SmartHelper Team
```

### Step 6: Test the Webhook

1. In Make.com, copy the complete webhook URL
2. Verify it's in `backend/routes/applicationRoutes.js` (lines ~65 and ~115)
3. In SmartHelper app:
   - Create a job (as Family)
   - Apply for job (as Helper)
   - Accept/Reject the application
4. Check Make.com logs for successful webhook call
5. Check helper's email inbox for email

---

## 📋 Verification Checklist

After setup, verify:

- [ ] Backend server is running
- [ ] Make.com scenario is ON/Active
- [ ] Webhook URL is correct in both Make.com and backend
- [ ] Email account is authenticated in Make.com
- [ ] Test email reaches helper's inbox
- [ ] Email formatting looks good
- [ ] Variables are replaced correctly
- [ ] Both acceptance and rejection emails work

---

## 🐛 Troubleshooting

### Email Not Received?
**Check:**
1. Make.com scenario execution logs
2. Backend server console for errors
3. Helper email address in database is correct
4. Email account hasn't hit daily send limit
5. Check spam/junk folder

**Solution:**
- Enable Make.com scenario (toggle button)
- Re-authenticate email account
- Check email account quota
- Try with a test helper email

### Wrong Variables?
**Check:**
- SQL query is fetching all fields correctly
- Variable names match: `payload.helperEmail`, `payload.jobTitle`, etc.
- Make.com uses correct syntax: `{{payload.fieldName}}`

**Solution:**
- Review the SQL query in backend
- Match variable names exactly
- Check Make.com variable documentation

### Formatting Issues?
**Check:**
- HTML email is working in Make.com preview
- Email client supports CSS (use inline styles)
- All style tags are closed properly

**Solution:**
- Use simpler HTML if complex formatting fails
- Test in different email clients
- Use inline CSS instead of style tags

---

## 📊 Email Content Customization

Edit messages in `backend/routes/applicationRoutes.js`:

**For Acceptance:**
```javascript
message: `Congratulations! Your application has been accepted for the job "${app.jobTitle}". Looking forward to working with you!`
```

**For Rejection:**
```javascript
message: `Thank you for your interest in the "${app.jobTitle}" job. Unfortunately, the family has selected another helper for this position. Keep applying - there are more opportunities ahead!`
```

---

## 🔒 Security Notes

- ✅ Webhook URL is in production environment variable (keep secret)
- ✅ No sensitive data in email body
- ✅ Only sends when application is processed
- ✅ Email sent asynchronously (non-blocking)
- ✅ Error handling prevents app crashes

---

## 📈 Future Enhancements

- [ ] Send confirmation email to family too
- [ ] Add SMS notifications
- [ ] Include payment instructions in acceptance email
- [ ] Add survey link in rejection email
- [ ] Schedule reminder emails before job date
- [ ] Log all emails sent to database
- [ ] Let family customize message template
- [ ] Support multiple email languages

---

## 📞 Support

If emails aren't working:
1. Check Make.com webhook logs
2. Verify database has correct helper email
3. Test Accept/Reject action in app
4. Review console errors in browser
5. Check backend server console

---

**Last Updated:** January 9, 2026
**Status:** ✅ Ready for Testing
