import { GmailMessage } from '../services/gmail';

export function aggregateData(sheetData: any[][], gmailData: GmailMessage[]) {
  return [
    ['Sheet rows:', sheetData.length],
    ['三井住友カード利用通知 (今日):', gmailData.length],
  ];
}