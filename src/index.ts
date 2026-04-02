import { createGmailClient, getGmailMessages } from "./services/gmail";

import {
  createSheetsClient,
  writeSheetData,
} from "./services/sheet";

async function main() {
  const spreadsheetId = process.env.SPREADSHEET_ID!;
  const sheetName = "メール抽出"

  const sheets = createSheetsClient();
  const gmail = createGmailClient();

  const targetDate = getTargetDate();
  const gmailData = await getGmailMessages(gmail, targetDate);

  const rows = gmailData.map((m) => {
    return [
      m.id,
      m.useDate,
      m.amount,
      m.shop,
      "", // 大分類（あとで分類）
      "", // 中分類
    ];
  });
  await writeSheetData(sheets, spreadsheetId, sheetName, rows);

  console.log("done 👍");
}
function getTargetDate(): Date {
  const input = process.env.TARGET_DATE;

  if (input) {
    return new Date(input);
  }

  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
}

main();
