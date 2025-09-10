

import { getItem, setItem } from './dataService.ts';

export interface WelcomeEmailDetails {
  studentName: string;
  studentEmail: string;
  studentId: string;
  password: string;
}

export const DEFAULT_WELCOME_EMAIL_TEMPLATE = `Dear {{studentName}},

Welcome to Reliant Learners Academy! We are thrilled to have you join us.

Your student portal account has been created. Here are your login details:
- Student ID: {{studentId}}
- Temporary Password: {{password}}

Please log in to the student portal at your earliest convenience to change your password and explore your dashboard.

We look forward to supporting you on your ACCA journey.

Best regards,
The Admissions Team
Reliant Learners Academy`;


/**
 * Simulates sending a welcome email to a new student.
 * In a real application, this would make an API call to a backend service.
 */
export const sendWelcomeEmail = async (details: WelcomeEmailDetails): Promise<{ success: boolean; message: string }> => {
  const template = getItem('welcomeEmailTemplate', DEFAULT_WELCOME_EMAIL_TEMPLATE);
  
  const emailBody = template
    .replace(/{{studentName}}/g, details.studentName)
    .replace(/{{studentId}}/g, details.studentId)
    .replace(/{{password}}/g, details.password);

  console.log('--- SIMULATING EMAIL SERVICE ---');
  console.log(`Sending welcome email to: ${details.studentEmail}`);
  console.log('Subject: Welcome to Reliant Learners Academy!');
  console.log(emailBody);
  console.log('---------------------------------');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real app, this would be the response from your backend API
  return { success: true, message: `Welcome email successfully sent to ${details.studentEmail}` };
};