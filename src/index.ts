import { createGmailClient, getGmailMessages } from "./services/gmail";

import {
  createSheetsClient,
  ensureSheetExists,
  readSheetData,
  writeSheetData,
  getSheetName,
} from "./services/sheet";

async function main() {
  const spreadsheetId = process.env.SPREADSHEET_ID!;
  const sheetName = getSheetName();

  const sheets = createSheetsClient();
  const gmail = createGmailClient();

  await ensureSheetExists(sheets, spreadsheetId, sheetName);

  const gmailData = await getGmailMessages(gmail);

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

main();
