import { useEffect, useState } from 'react';
import { Box, Button, MenuItem, TextField, Typography } from '@mui/material';
import { fetchThread, fetchThreads } from '../threads';
import { errorMessage } from '../errors';
import type { Thread } from '../types';

type Props = { onImport: (names: string[]) => void };

/** 既存のランクのキャラクター名を読み込み、新しいランクの候補にする（レートは引き継がない） */
export default function ImportCandidates({ onImport }: Props) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // トップページと同じ一覧を使うので、保存済みならここでの読み取りは発生しない
    Promise.all([fetchThreads('updatedAt', 5), fetchThreads('createdAt', 30)])
      .then(([updated, created]) => {
        const seen = new Set<string>();
        setThreads([...updated, ...created].filter((t) => !seen.has(t.id) && seen.add(t.id)));
      })
      .catch((e) => setError(errorMessage(e, 'ランク一覧の読み込み')));
  }, []);

  const importSelected = async () => {
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      const thread = await fetchThread(selected);
      if (!thread) throw new Error('キャラランクが見つかりません。');
      onImport(thread.characters.map((c) => c.name));
    } catch (e) {
      setError(errorMessage(e, '読み込み'));
    } finally {
      setLoading(false);
    }
  };

  if (threads.length === 0 && !error) return null;

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          select
          label="既存のランクからキャラクターを読み込む"
          fullWidth
          margin="dense"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {threads.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.title}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" onClick={importSelected} disabled={!selected || loading} sx={{ flexShrink: 0, mt: 0.5 }}>
          読み込む
        </Button>
      </Box>
      {error && <Typography sx={{ fontSize: 14, color: 'error.main' }}>{error}</Typography>}
    </Box>
  );
}
