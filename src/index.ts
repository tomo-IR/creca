import { createGmailClient, getGmailMessages } from "./services/gmail";

import { createSheetsClient, writeSheetData } from "./services/sheet";

async function main() {
  const spreadsheetId = process.env.SPREADSHEET_ID!;
  const sheetName = "メール抽出";

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
  console.log(`input: ${input}`);

  if (input) {
    const d = new Date(input);
    return new Date(d.getTime() + 9 * 60 * 60 * 1000);
  }

  const now = new Date();

  // JSTに変換
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  // 前日
  jst.setDate(jst.getDate() - 1);

  return jst;
}

main();
