import { Box, Button, Typography } from '@mui/material';
import { ErrorMessage, SectionTitle } from './Loading';

type Props = {
  pair: [string, string] | null;
  /** 投票の送信に失敗したときのメッセージ */
  error: string;
  /** 勝者・敗者の名前。「わからない」は両方空文字 */
  onSubmit: (winner: string, loser: string) => void;
};

export default function VoteForm({ pair, error, onSubmit }: Props) {
  return (
    <section>
      <SectionTitle>どっちが強い？</SectionTitle>
      {pair ? (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 1, alignItems: 'center' }}>
            <Button variant="outlined" size="large" sx={{ py: 2 }} onClick={() => onSubmit(pair[0], pair[1])}>
              {pair[0]}
            </Button>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>vs</Typography>
            <Button variant="outlined" size="large" sx={{ py: 2 }} onClick={() => onSubmit(pair[1], pair[0])}>
              {pair[1]}
            </Button>
          </Box>
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Button size="small" sx={{ color: 'text.secondary' }} onClick={() => onSubmit('', '')}>
              わからない
            </Button>
          </Box>
        </>
      ) : (
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>比べるには候補が2つ以上必要です。</Typography>
      )}
      {error && <ErrorMessage message={error} />}
    </section>
  );
}
