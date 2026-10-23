import { FirestoreError } from 'firebase/firestore';

/** Firestore のエラーを利用者向けの文に直す。action は「読み込み」「投票の送信」など */
export const errorMessage = (e: unknown, action: string): string => {
  if (!(e instanceof FirestoreError)) return e instanceof Error && e.message ? e.message : `${action}に失敗しました。`;
  switch (e.code) {
    case 'resource-exhausted':
      return `本日の${action}の受付上限に達しました。時間をおいてもう一度お試しください。`;
    case 'unavailable':
      return 'サーバーに接続できません。通信状況を確認してください。';
    case 'aborted':
    case 'failed-precondition':
      return `混み合っているため${action}できませんでした。`;
    case 'permission-denied':
      return `${action}が許可されませんでした。`;
    default:
      return `${action}に失敗しました。`;
  }
};
