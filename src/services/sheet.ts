import { google } from "googleapis";
import * as path from "path";

export function createSheetsClient(): any {
  const serviceAccountKeyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  const auth = serviceAccountKeyJson
    ? new google.auth.GoogleAuth({
        credentials: JSON.parse(serviceAccountKeyJson),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      })
    : new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, "../../credentials/service-account.json"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

  return google.sheets({ version: "v4", auth });
}

export async function readSheetData(
  sheets: any,
  spreadsheetId: string,
  sheetName: string,
) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:Z100`,
  });
  return res.data.values || [];
}

export async function writeSheetData(
  sheets: any,
  spreadsheetId: string,
  sheetName: string,
  data: any[][],
) {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A3`,
    valueInputOption: "RAW",
    requestBody: {
      values: data,
    },
  });
}
