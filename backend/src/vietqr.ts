/**
 * Helper to generate official VietQR Quick Link
 * Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<INFO>&accountName=<NAME>
 */
export function generateVietQRUrl(params: {
  bankId: string;
  accountNo: string;
  accountName: string;
  amount: number;
  description: string;
  template?: 'compact' | 'compact2' | 'qr_only' | 'print';
}): string {
  const bank = encodeURIComponent(params.bankId || 'MBBank');
  const accNo = encodeURIComponent(params.accountNo || '0988888888');
  const template = params.template || 'compact2';
  const amount = params.amount || 0;
  const addInfo = encodeURIComponent(params.description || '');
  const accName = encodeURIComponent(params.accountName || '');

  return `https://img.vietqr.io/image/${bank}-${accNo}-${template}.png?amount=${amount}&addInfo=${addInfo}&accountName=${accName}`;
}
