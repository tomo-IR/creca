function main(): void {
  console.log("===== TypeScript Scheduled Run =====");
  console.log(`timestamp: ${new Date().toISOString()}`);

  const sheetId = process.env.SPREADSHEET_ID;
  if (!sheetId) {
    console.error("Missing required environment variable SPREADSHEET_ID");
    process.exit(1);
  }

  // ここに本来のロジックを追加します。
  console.log(`SPREADSHEET_ID: ${sheetId}`);
  console.log("実行テスト完了: TypeScriptコードが正常に動作しています。");
}

main();
