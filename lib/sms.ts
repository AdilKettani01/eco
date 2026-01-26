import messagebird from 'messagebird';

// Initialize MessageBird client
const messageBirdClient = process.env.MESSAGEBIRD_API_KEY
  ? messagebird(process.env.MESSAGEBIRD_API_KEY)
  : null;

export interface SendSMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send SMS using MessageBird
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

  // Check if MessageBird is configured
  if (!messageBirdClient) {
    console.error('❌ MessageBird API key not configured');
    return {
      success: false,
      error: 'SMS service not configured',
    };
  }

  try {
    // Send SMS via MessageBird
    const result = await new Promise<any>((resolve, reject) => {
      messageBirdClient.messages.create(
        {
          originator: 'EcoLimpio', // Sender name (max 11 alphanumeric chars)
          recipients: [to],
          body: message,
        },
        (err: any, response: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        }
      );
    });

    console.log(`✅ SMS sent successfully to ${to}, MessageBird ID: ${result.id}`);

    return {
      success: true,
      messageId: result.id,
    };
  } catch (error: any) {
    console.error('❌ Failed to send SMS via MessageBird:', error);

    // Extract error message
    let errorMessage = 'Failed to send SMS';
    if (error.errors && error.errors.length > 0) {
      errorMessage = error.errors[0].description || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
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
