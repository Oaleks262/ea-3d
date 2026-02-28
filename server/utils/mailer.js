import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load settings from JSON file
 */
function loadSettings() {
  try {
    const settingsPath = path.join(__dirname, '../data/settings.json');
    const settingsData = fs.readFileSync(settingsPath, 'utf-8');
    return JSON.parse(settingsData);
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {};
  }
}

/**
 * Create transporter with SMTP config from settings or environment
 */
function createTransporter() {
  const settings = loadSettings();
  const smtp = settings.smtp || {};

  // Use settings from admin panel, fallback to environment variables
  const host = smtp.host || process.env.SMTP_HOST;
  const port = smtp.port || process.env.SMTP_PORT || '587';
  const user = smtp.user || process.env.SMTP_USER;
  const password = smtp.password || process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host: host,
    port: parseInt(port),
    secure: parseInt(port) === 465, // true for 465, false for other ports
    auth: {
      user: user,
      pass: password
    }
  });
}

/**
 * Send email notification to admin about new contact message
 */
export async function sendAdminNotification(messageData) {
  try {
    const transporter = createTransporter();
    const settings = loadSettings();
    const smtp = settings.smtp || {};

    const { name, email, requestType, message } = messageData;

    const logoPath = path.join(__dirname, '../../client/public/logo-email.png');

    const fromEmail = smtp.user || process.env.SMTP_USER;
    const adminEmail = settings.adminEmail || process.env.ADMIN_EMAIL;

    const mailOptions = {
      from: `"Портфоліо Єлизавети Антонюк" <${fromEmail}>`,
      to: adminEmail,
      subject: `🔔 Нове повідомлення з форми - ${requestType}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7B2FF7 0%, #FF2FD1 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .logo { max-width: 120px; margin-bottom: 15px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #7B2FF7; margin-bottom: 5px; }
            .value { background: white; padding: 12px; border-radius: 4px; border-left: 3px solid #7B2FF7; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="cid:logo" alt="Logo" class="logo" />
              <h1 style="margin: 0;">Нове повідомлення з форми</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Ім'я:</div>
                <div class="value">${name}</div>
              </div>

              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>

              <div class="field">
                <div class="label">Тип запиту:</div>
                <div class="value">${requestType}</div>
              </div>

              <div class="field">
                <div class="label">Повідомлення:</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>

              <div class="footer">
                <p>Отримано ${new Date().toLocaleString('uk-UA')}</p>
                <p>Відповідайте безпосередньо на цей email, щоб відповісти ${name}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      replyTo: email,
      attachments: [{
        filename: 'logo.png',
        path: logoPath,
        cid: 'logo'
      }]
    };

    await transporter.sendMail(mailOptions);
    console.log('Admin notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    throw error;
  }
}

/**
 * Send auto-reply to client confirming message receipt
 */
export async function sendClientAutoReply(messageData) {
  try {
    const transporter = createTransporter();
    const settings = loadSettings();
    const smtp = settings.smtp || {};

    const { name, email } = messageData;

    const logoPath = path.join(__dirname, '../../client/public/logo-email.png');

    const fromEmail = smtp.user || process.env.SMTP_USER;

    const mailOptions = {
      from: `"Єлизавета Антонюк" <${fromEmail}>`,
      to: email,
      subject: 'Дякую за звернення!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7B2FF7 0%, #FF2FD1 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .logo { max-width: 120px; margin-bottom: 15px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .social-links { margin-top: 20px; }
            .social-links a { color: #7B2FF7; text-decoration: none; margin: 0 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="cid:logo" alt="Logo" class="logo" />
              <h1 style="margin: 0;">Дякую за звернення!</h1>
            </div>
            <div class="content">
              <p>Привіт, ${name}!</p>

              <p>Дякую за ваше повідомлення! Я отримала ваш запит і з нетерпінням чекаю можливості дізнатися більше про ваш проєкт.</p>

              <p>Я ретельно розгляну ваше повідомлення та зв'яжуся з вами протягом 24 годин з детальною відповіддю.</p>

              <p>Тим часом запрошую переглянути мої останні роботи в портфоліо або зв'язатися зі мною в соціальних мережах.</p>

              <p>З нетерпінням чекаю співпраці з вами!</p>

              <p style="margin-top: 30px;">
                З повагою,<br>
                <strong>Єлизавета Антонюк</strong><br>
                3D Аніматор & Motion Дизайнер
              </p>

              <div class="footer">
                <div class="social-links">
                  <a href="https://www.instagram.com/yelyzaveta_antoniuk/">Instagram</a> |
                  <a href="https://www.linkedin.com/in/yelyzaveta-antoniuk-151285165/">LinkedIn</a>
                </div>
                <p style="margin-top: 15px; color: #999; font-size: 12px;">
                  Це автоматична відповідь. Будь ласка, не відповідайте на цей email.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [{
        filename: 'logo.png',
        path: logoPath,
        cid: 'logo'
      }]
    };

    await transporter.sendMail(mailOptions);
    console.log('Client auto-reply sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending client auto-reply:', error);
    throw error;
  }
}

/**
 * Send both emails (admin notification + client auto-reply)
 */
export async function sendContactEmails(messageData) {
  try {
    await Promise.all([
      sendAdminNotification(messageData),
      sendClientAutoReply(messageData)
    ]);
    return true;
  } catch (error) {
    // Even if email fails, we don't want to fail the message submission
    console.error('Email sending failed:', error);
    return false;
  }
}
