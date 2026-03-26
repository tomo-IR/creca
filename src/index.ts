import {
  createGmailClient,
  getGmailMessages,
} from './services/gmail';

import {
  createSheetsClient,
  ensureSheetExists,
  readSheetData,
  writeSheetData,
} from './services/sheet';

import { aggregateData } from './utils/aggregate';

async function main() {
  const spreadsheetId = process.env.SPREADSHEET_ID!;
  const sheetName = process.env.SHEET_NAME || 'Sheet1';

  const sheets = createSheetsClient();
  const gmail = createGmailClient();

  await ensureSheetExists(sheets, spreadsheetId, sheetName);

  const [sheetData, gmailData] = await Promise.all([
    readSheetData(sheets, spreadsheetId, sheetName),
    getGmailMessages(gmail),
  ]);

  const aggregated = aggregateData(sheetData, gmailData);

  await writeSheetData(sheets, spreadsheetId, sheetName, aggregated);

  console.log('done 👍');
}

main();