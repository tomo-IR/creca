import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { format } from "path";

export type GmailMessage = {
  id: string;
  subject: string;
  from: string;
  date: string;
  body: string;
  useDate: string;
  amount: string;
  shop: string;
};

export function createGmailClient(): any {
  const oauth2Client = new OAuth2Client(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "urn:ietf:wg:oauth:2.0:oob",
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

export async function getGmailMessages(
  gmail: any,
  targetDate: Date,
): Promise<GmailMessage[]> {
  const yesterday = new Date(Date.now());
  yesterday.setDate(yesterday.getDate() - 1);

  const after = formatDate(targetDate);
  const next = new Date(targetDate);
  next.setDate(next.getDate() + 1);
  const before = formatDate(next);

  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults: 50,
   q: `from:statement@vpass.ne.jp subject:"ご利用のお知らせ【三井住友カード】" after:${after} before:${before}`,
  });

  const messages = response.data.messages || [];
  const results: GmailMessage[] = [];

  for (const message of messages) {
    const msg = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
      format: "full",
    });

    let body = "";
    const payload = msg.data.payload;

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === "text/plain" && part.body?.data) {
          body = Buffer.from(part.body.data, "base64").toString("utf-8");
          break;
        }
      }
    } else if (payload.body?.data) {
      body = Buffer.from(payload.body.data, "base64").toString("utf-8");
    }
    const parsed = parseMail(body);
    results.push({
      id: msg.data.id!,
      subject: payload.headers?.find((h) => h.name === "Subject")?.value || "",
      from: payload.headers?.find((h) => h.name === "From")?.value || "",
      date: payload.headers?.find((h) => h.name === "Date")?.value || "",
      body,
      useDate: parsed.date,
      amount: parsed.amount,
      shop: parsed.shop,
    });
  }

  return results;
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

function parseMail(body: string) {
  const dateMatch = body.match(/利用日[:：]\s*(\d{4}\/\d{2}\/\d{2})/);
  const amountMatch = body.match(/利用金額[:：]\s*([\d,]+)円/);
  const shopMatch = body.match(/利用先[:：]\s*(.+)/);

  const rawAmount = amountMatch?.[1] || "";

  return {
    date: dateMatch?.[1] || "",
    amount: rawAmount.replace(/,/g, ""), // カンマを削除して数値化しやすくする
    shop: shopMatch?.[1] || "",
  };
}
