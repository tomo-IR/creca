import { google } from "googleapis";
import * as path from "path";
type CategoryRule = {
  keyword: string;
  main: string;
  sub: string;
};
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
  const sheetData = await readSheetData(sheets, spreadsheetId, sheetName);
  const existingIds = sheetData
    .filter((row) => Array.isArray(row) && row.length > 0)
    .filter((row) => row[0] !== "No.")
    .map((row) => row[0]);

  const filteredData = data.filter((row) => {
    const rowString = row[0];
    return !existingIds.includes(rowString);
  });

  const rules: CategoryRule[] = JSON.parse(process.env.CATEGORY_RULES || "[]");

  const result = filteredData.map((row) => {
    const store = row[3]; // 利用先

    const { main, sub } = categorize(store, rules);
    return [row[0], row[1], row[2], row[3], main, sub];
  });
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A3`,
    valueInputOption: "RAW",
    requestBody: {
      values: result,
    },
  });
}

function normalize(str: string) {
  return str
    .toUpperCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
      String.fromCharCode(s.charCodeAt(0) - 0xfee0),
    );
}
function categorize(store: string, rules: CategoryRule[]) {
  const normalized = normalize(store);

  const hit = rules.find((rule) =>
    normalized.includes(normalize(rule.keyword)),
  );

  return hit
    ? { main: hit.main, sub: hit.sub }
    : { main: "未分類", sub: "未分類" };
}
