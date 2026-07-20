/**
 * WhatsApp API Configuration
 * This file handles all WhatsApp Business API configuration
 */

const axios = require('axios');

class WhatsAppConfig {
  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';
    this.baseURL = `https://graph.instagram.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
    this.verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  }

  /**
   * Validate that all required credentials are set
   */
  validateConfig() {
    const required = [
      'WHATSAPP_PHONE_NUMBER_ID',
      'WHATSAPP_BUSINESS_ACCOUNT_ID',
      'WHATSAPP_ACCESS_TOKEN'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing WhatsApp configuration: ${missing.join(', ')}. Please set these in your .env file`
      );
    }

    return true;
  }

  /**
   * Send a text message via WhatsApp
   * @param {string} recipientNumber - Recipient phone number (with country code, e.g., 919876543210)
   * @param {string} message - Message text to send
   * @returns {Promise<Object>} API response
   */
  async sendTextMessage(recipientNumber, message) {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipientNumber,
          type: 'text',
          text: {
            preview_url: true,
            body: message
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Send a template message
   * @param {string} recipientNumber - Recipient phone number
   * @param {string} templateName - Template name (must be approved by Meta)
   * @param {Array} parameters - Template parameters
   * @returns {Promise<Object>} API response
   */
  async sendTemplateMessage(recipientNumber, templateName, parameters = []) {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          messaging_product: 'whatsapp',
          to: recipientNumber,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'en_US'
            },
            components: [
              {
                type: 'body',
                parameters: parameters.map(param => ({ type: 'text', text: param }))
              }
            ]
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('WhatsApp Template API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Verify webhook callback token
   * @param {string} token - Token from webhook request
   * @returns {boolean} Whether token is valid
   */
  verifyWebhookToken(token) {
    return token === this.verifyToken;
  }

  /**
   * Handle incoming webhook events
   * @param {Object} body - Webhook payload
   * @returns {Object} Processed webhook data
   */
  processWebhook(body) {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    return {
      messageId: value?.messages?.[0]?.id,
      senderId: value?.messages?.[0]?.from,
      messageType: value?.messages?.[0]?.type,
      text: value?.messages?.[0]?.text?.body,
      status: value?.statuses?.[0]?.status,
      statusId: value?.statuses?.[0]?.id,
      timestamp: value?.messages?.[0]?.timestamp
    };
  }
}

module.exports = new WhatsAppConfig();
