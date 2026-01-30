// Bird API configuration for email channel
const BIRD_EMAIL_API_URL =
  process.env.BIRD_EMAIL_API_URL ||
  'https://api.bird.com/workspaces/085a7bc1-6344-4b44-9433-5d4dc16e6806/channels/dca724f2-ce21-55e5-9a7c-68ab4875f81f/messages';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Bird API
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML email body
 * @returns Promise with result containing success status and messageId or error
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<SendEmailResult> {
  // Development mode - log to console
  if (process.env.NODE_ENV === 'development') {
    console.log(`📧 [DEV MODE] Email to ${to}: ${subject}`);
    return {
      success: true,
      messageId: 'dev-email-' + Date.now(),
    };
  }

  const apiKey = process.env.BIRD_EMAIL_API_KEY;
  if (!apiKey) {
    console.error('❌ Bird EMAIL API key not configured');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    const response = await fetch(BIRD_EMAIL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiver: {
          contacts: [
            {
              identifierKey: 'emailaddress',
              identifierValue: to,
            },
          ],
        },
        body: {
          type: 'html',
          html: {
            text: html,
            metadata: {
              subject,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Bird API error:', response.status, errorData);
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}: Failed to send email`,
      };
    }

    const result = await response.json();
    console.log(`✅ Email sent successfully to ${to}, Bird ID: ${result.id}`);

    return {
      success: true,
      messageId: result.id,
    };
  } catch (error: any) {
    console.error('❌ Failed to send email via Bird:', error);

    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Basic email format validation
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
