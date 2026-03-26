import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export type GmailMessage = {
  id: string;
  subject: string;
  from: string;
  date: string;
  body: string;
};

export function createGmailClient(): any {
  const oauth2Client = new OAuth2Client(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export async function getGmailMessages(gmail: any): Promise<GmailMessage[]> {
  const today = new Date();
  const dateStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

  const response = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 50,
    q: `subject:"ご利用のお知らせ【三井住友カード】" after:${dateStr}`,
  });

  const messages = response.data.messages || [];
  const results: GmailMessage[] = [];

  for (const message of messages) {
    const msg = await gmail.users.messages.get({
      userId: 'me',
      id: message.id,
      format: 'full',
    });

    let body = '';
    const payload = msg.data.payload;

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          break;
        }
      }
    } else if (payload.body?.data) {
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    results.push({
      id: msg.data.id!,
      subject: payload.headers?.find(h => h.name === 'Subject')?.value || '',
      from: payload.headers?.find(h => h.name === 'From')?.value || '',
      date: payload.headers?.find(h => h.name === 'Date')?.value || '',
      body,
    });
  }

  return results;
}