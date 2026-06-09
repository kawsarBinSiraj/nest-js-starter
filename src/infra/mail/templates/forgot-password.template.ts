/**
 * File: src/infra/mail/templates/forgot-password.template.ts
 * Purpose: HTML email template with a password-reset link (1-hour expiry).
 */
export function forgotPasswordTemplate(
  firstName: string,
  resetUrl: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reset Your Password</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Password Reset Request</h2>
  <p>Hi ${firstName},</p>
  <p>We received a request to reset your password. Click the button below to reset it.</p>
  <p>
    <a href="${resetUrl}"
       style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;display:inline-block;">
      Reset Password
    </a>
  </p>
  <p>This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
</body>
</html>`;
}
