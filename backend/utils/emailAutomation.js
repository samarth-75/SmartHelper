/**
 * Email Automation Setup for SmartHelper
 * 
 * This file documents the Make.com webhook integration for sending automated emails
 * when helpers' applications are accepted or rejected.
 * 
 * WEBHOOK URL: https://hook.eu1.make.com/fb793mla7g3uh3j83pnerj987nm4h9qv
 * 
 * ============================================================================
 * DATA SENT TO MAKE.COM WEBHOOK:
 * ============================================================================
 * 
 * FOR ACCEPTED APPLICATIONS:
 * {
 *   "helperEmail": "helper@example.com",
 *   "helperName": "Maria Garcia",
 *   "familyName": "Smith Family",
 *   "jobTitle": "Housekeeping",
 *   "jobLocation": "Downtown, City",
 *   "jobDate": "2026-01-15",
 *   "jobTime": "09:00",
 *   "payPerHour": "200",
 *   "status": "accepted",
 *   "subject": "🎉 Application Accepted - Housekeeping",
 *   "message": "Congratulations! Your application has been accepted for the job \"Housekeeping\". Looking forward to working with you!"
 * }
 * 
 * FOR REJECTED APPLICATIONS:
 * {
 *   "helperEmail": "helper@example.com",
 *   "helperName": "Maria Garcia",
 *   "familyName": "Smith Family",
 *   "jobTitle": "Housekeeping",
 *   "jobLocation": "Downtown, City",
 *   "status": "rejected",
 *   "subject": "Application Status Update - Housekeeping",
 *   "message": "Thank you for your interest in the \"Housekeeping\" job. Unfortunately, the family has selected another helper for this position. Keep applying - there are more opportunities ahead!"
 * }
 * 
 * ============================================================================
 * MAKE.COM WORKFLOW SETUP INSTRUCTIONS:
 * ============================================================================
 * 
 * 1. CREATE NEW SCENARIO:
 *    - Create a new scenario in Make.com
 *    - Name it: "SmartHelper - Application Email Notifications"
 * 
 * 2. ADD WEBHOOK TRIGGER:
 *    - Add "Webhooks" module as the first step
 *    - Choose "Custom Webhook"
 *    - Set the webhook URL you get from Make as the POST endpoint in the backend
 *    - Click "Save" to generate the webhook URL
 * 
 * 3. ADD EMAIL MODULE:
 *    - Add "Gmail" or "Email" module (depending on your provider)
 *    - Configure your email account (SmartHelper notification email)
 *    - Set "To" field: {{payload.helperEmail}}
 *    - Set "Subject" field: {{payload.subject}}
 * 
 * 4. CONFIGURE EMAIL BODY:
 *    - In the "Body" field, create an HTML email template:
 * 
 * IF STATUS IS "ACCEPTED":
 * 
 * <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
 *   <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
 *     <h1 style="margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
 *     <p style="margin: 10px 0 0 0; font-size: 16px;">Your Application Has Been Accepted</p>
 *   </div>
 *   
 *   <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
 *     <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">
 *       Hi {{payload.helperName}},
 *     </p>
 *     
 *     <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">
 *       {{payload.message}}
 *     </p>
 *     
 *     <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px;">
 *       <h3 style="margin: 0 0 15px 0; color: #333;">Job Details:</h3>
 *       <p style="margin: 8px 0; color: #666;">
 *         <strong>Family:</strong> {{payload.familyName}}<br>
 *         <strong>Job Title:</strong> {{payload.jobTitle}}<br>
 *         <strong>Location:</strong> {{payload.jobLocation}}<br>
 *         <strong>Date:</strong> {{payload.jobDate}}<br>
 *         <strong>Time:</strong> {{payload.jobTime}}<br>
 *         <strong>Rate:</strong> Rs {{payload.payPerHour}}/hour
 *       </p>
 *     </div>
 *     
 *     <p style="font-size: 14px; color: #666; margin: 20px 0 0 0; text-align: center;">
 *       Please check the SmartHelper app for more details and to confirm your availability.
 *     </p>
 *   </div>
 *   
 *   <div style="background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
 *     <p style="margin: 0; font-size: 12px;">SmartHelper &copy; 2026 | All Rights Reserved</p>
 *   </div>
 * </div>
 * 
 * IF STATUS IS "REJECTED":
 * 
 * <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
 *   <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
 *     <h1 style="margin: 0; font-size: 28px;">Application Update</h1>
 *     <p style="margin: 10px 0 0 0; font-size: 16px;">We've Made a Decision</p>
 *   </div>
 *   
 *   <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
 *     <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">
 *       Hi {{payload.helperName}},
 *     </p>
 *     
 *     <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">
 *       {{payload.message}}
 *     </p>
 *     
 *     <div style="background: white; border-left: 4px solid #f5576c; padding: 20px; margin: 20px 0; border-radius: 5px;">
 *       <h3 style="margin: 0 0 15px 0; color: #333;">About the Job:</h3>
 *       <p style="margin: 8px 0; color: #666;">
 *         <strong>Family:</strong> {{payload.familyName}}<br>
 *         <strong>Job Title:</strong> {{payload.jobTitle}}<br>
 *         <strong>Location:</strong> {{payload.jobLocation}}
 *       </p>
 *     </div>
 *     
 *     <p style="font-size: 14px; color: #666; margin: 20px 0 0 0; text-align: center; background: #fff3cd; padding: 15px; border-radius: 5px;">
 *       💡 Don't worry! There are many more job opportunities available. Keep applying and improving your profile!
 *     </p>
 *   </div>
 *   
 *   <div style="background: #f5576c; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
 *     <p style="margin: 0; font-size: 12px;">SmartHelper &copy; 2026 | All Rights Reserved</p>
 *   </div>
 * </div>
 * 
 * 5. ADD CONDITIONAL LOGIC (Optional but Recommended):
 *    - Use "Router" module to handle different email templates based on status
 *    - Route 1: If {{payload.status}} equals "accepted" → Send acceptance email
 *    - Route 2: If {{payload.status}} equals "rejected" → Send rejection email
 * 
 * 6. TEST THE WEBHOOK:
 *    - In Make.com, copy the generated webhook URL
 *    - Add it to the backend code (already done in applicationRoutes.js)
 *    - Accept/Reject an application in SmartHelper
 *    - Check if the email is received correctly
 * 
 * ============================================================================
 * IMPORTANT NOTES:
 * ============================================================================
 * 
 * - The webhook URL should be kept SECRET and not exposed in public repositories
 * - Make sure the email account used in Make.com has "Less Secure App Access"
 *   enabled or is configured with appropriate OAuth tokens
 * - Test the workflow thoroughly before deploying to production
 * - Monitor the Make.com logs for any failed webhook calls
 * - Consider adding retry logic in Make.com if emails fail to send
 * 
 * ============================================================================
 * BACKEND VARIABLES SENT:
 * ============================================================================
 * 
 * - helperEmail: Helper's email address (recipient)
 * - helperName: Helper's full name
 * - familyName: Family's name (who posted the job)
 * - jobTitle: Job title (e.g., "Housekeeping", "Childcare")
 * - jobLocation: Job location
 * - jobDate: Job date (YYYY-MM-DD format) - only for accepted
 * - jobTime: Job time (HH:MM format) - only for accepted
 * - payPerHour: Pay rate per hour - only for accepted
 * - status: "accepted" or "rejected"
 * - subject: Email subject line
 * - message: Main message body (can be customized)
 * 
 * ============================================================================
 */

export const emailTemplates = {
  accepted: {
    subject: '🎉 Application Accepted - {{jobTitle}}',
    template: 'acceptance_email_html'
  },
  rejected: {
    subject: 'Application Status Update - {{jobTitle}}',
    template: 'rejection_email_html'
  }
};
