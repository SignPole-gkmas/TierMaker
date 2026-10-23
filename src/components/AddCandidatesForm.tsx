import { useState } from 'react';
import { Box, Button, Collapse, TextField, Typography } from '@mui/material';
import { parseNames } from '../rating';
import { addCandidates } from '../threads';
import type { Thread } from '../types';

type Props = { threadId: string; onAdded: (thread: Thread) => void };

export default function AddCandidatesForm({ threadId, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ error: boolean; message: string } | null>(null);

  const submit = async () => {
    const names = parseNames(text);
    if (names.length === 0) {
      setResult({ error: true, message: '追加する候補を入力してください。' });
      return;
    }
    setSending(true);
    try {
      const { thread, added, skipped } = await addCandidates(threadId, names);
      onAdded(thread);
      setText('');
      const messages = [];
      if (added.length > 0) messages.push(`${added.length}件追加しました：${added.join('、')}`);
      if (skipped.length > 0) messages.push(`既にあるためスキップ：${skipped.join('、')}`);
      setResult({ error: false, message: messages.join('\n') });
    } catch (e) {
      setResult({ error: true, message: e instanceof Error ? e.message : '追加に失敗しました。' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Box component="section" sx={{ mt: 4 }}>
      <Button size="small" onClick={() => setOpen((o) => !o)} sx={{ ml: -1 }}>
        {open ? '− 候補の追加を閉じる' : '＋ 候補を追加'}
      </Button>
      <Collapse in={open}>
        <TextField
          placeholder="1行に1つずつ入力"
          fullWidth
          margin="dense"
          multiline
          minRows={3}
          helperText="追加した候補は平均的な点数から始まります。"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {result && (
          <Typography
            sx={{ my: 1, fontSize: 14, whiteSpace: 'pre-line', color: result.error ? 'error.main' : 'primary.dark' }}
          >
            {result.message}
          </Typography>
        )}
        <Button variant="contained" disabled={sending} onClick={submit} sx={{ mt: 1 }}>
          追加
        </Button>
      </Collapse>
    </Box>
  );
}
