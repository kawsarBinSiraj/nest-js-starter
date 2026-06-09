/**
 * File: src/infra/mail/templates/reset-password.template.ts
 * Purpose: HTML email confirming that the user's password was successfully reset.
 */
export function resetPasswordTemplate(
  firstName: string,
  appUrl: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Password Reset Successful</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Password Reset Successful</h2>
  <p>Hi ${firstName},</p>
  <p>Your password has been successfully reset.</p>
  <p>You can now log in with your new password: <a href="${appUrl}">${appUrl}</a></p>
  <p>If you did not perform this action, please contact support immediately.</p>
</body>
</html>`;
}
