// Bird API configuration
const BIRD_API_URL = process.env.BIRD_API_URL || 'https://api.bird.com/workspaces/085a7bc1-6344-4b44-9433-5d4dc16e6806/channels/f0b8d52c-d76a-5465-82ca-f09b90dbf2f3/messages';

export interface SendSMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send SMS using Bird API
 * @param to - Phone number in E.164 format (e.g., +34612345678)
 * @param message - SMS message content
 * @returns Promise with result containing success status and messageId or error
 */
export async function sendSMS(to: string, message: string): Promise<SendSMSResult> {
  // Development mode - log to console
  if (process.env.NODE_ENV === 'development') {
    console.log(`📱 [DEV MODE] SMS to ${to}: ${message}`);
    return {
      success: true,
      messageId: 'dev-message-' + Date.now(),
    };
  }

  // Check if Bird API key is configured
  const apiKey = process.env.BIRD_API_KEY;
  if (!apiKey) {
    console.error('❌ Bird API key not configured');
    return {
      success: false,
      error: 'SMS service not configured',
    };
  }

  try {
    const response = await fetch(BIRD_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body: {
          type: 'text',
          text: {
            text: message,
          },
        },
        receiver: {
          contacts: [
            {
              identifierValue: to,
              identifierKey: 'phonenumber',
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Bird API error:', response.status, errorData);
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}: Failed to send SMS`,
      };
    }

    const result = await response.json();
    console.log(`✅ SMS sent successfully to ${to}, Bird ID: ${result.id}`);

    return {
      success: true,
      messageId: result.id,
    };
  } catch (error: any) {
    console.error('❌ Failed to send SMS via Bird:', error);

    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    };
  }
}

/**
 * Validate phone number format (basic E.164 validation)
 * @param phone - Phone number to validate
 * @returns true if valid E.164 format
 */
export function isValidPhoneNumber(phone: string): boolean {
  // E.164 format: +[country code][number] (max 15 digits)
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}
