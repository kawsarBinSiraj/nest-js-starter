/**
 * File: src/infra/mail/templates/signup.template.ts
 * Purpose: HTML welcome email sent after a new user signs up.
 */
export function signupTemplate(firstName: string, appUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome!</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Welcome, ${firstName}!</h2>
  <p>Your account has been successfully created.</p>
  <p>You can now log in at: <a href="${appUrl}">${appUrl}</a></p>
  <p>Thank you for joining us!</p>
</body>
</html>`;
}
