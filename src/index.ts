import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

async function main(): Promise<void> {
  console.log("===== TypeScript Scheduled Run =====");
  console.log(`timestamp: ${new Date().toISOString()}`);

  const spreadsheetId = process.env.SPREADSHEET_ID;
  if (!spreadsheetId) {
    console.error("Missing required environment variable SPREADSHEET_ID");
    process.exit(1);
  }

  const sheetName = process.env.SHEET_NAME || 'Sheet1';

  // Google Sheets API setup
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../credentials/service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    await ensureSheetExists(sheets, spreadsheetId, sheetName);

    const data = await readSheetData(sheets, spreadsheetId, sheetName);
    console.log('Sheet data:', data);

    const aggregated = aggregateData(data);
    console.log('Aggregated data:', aggregated);

    await writeSheetData(sheets, spreadsheetId, sheetName, aggregated);
    console.log('Spreadsheet operation completed successfully.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

async function ensureSheetExists(sheets: any, spreadsheetId: string, sheetName: string): Promise<void> {
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetsMetadata = res.data.sheets || [];
  const exists = sheetsMetadata.some((sheet: any) => sheet.properties?.title === sheetName);

  if (!exists) {
    console.log(`Sheet "${sheetName}" not found. Creating...`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      },
    });
    console.log(`Sheet "${sheetName}" created.`);
  }
}

async function readSheetData(sheets: any, spreadsheetId: string, sheetName: string): Promise<any[][]> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:Z100`,
  });
  return response.data.values || [];
}

function aggregateData(data: any[][]): any[][] {
  const count = data.length;
  return [['Total rows:', count]];
}

async function writeSheetData(sheets: any, spreadsheetId: string, sheetName: string, data: any[][]): Promise<void> {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A101:B101`,
    valueInputOption: 'RAW',
    requestBody: {
      values: data,
    },
  });
}

main();
