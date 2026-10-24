import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography } from '@mui/material';
import { ErrorMessage } from '../components/Loading';
import ImportCandidates from '../components/ImportCandidates';
import { MAX_CHARACTERS, parseNames } from '../rating';
import { createThread } from '../threads';
import { routes } from '../routes';

type FormValues = { title: string; description: string; charactersStr: string };

const defaultValues: FormValues = { title: '', description: '', charactersStr: '' };

export default function AddThreadPage() {
  const { register, reset, handleSubmit, formState, getValues, setValue } = useForm<FormValues>({ defaultValues });
  const [errorMsg, setErrorMsg] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const navigate = useNavigate();

  // 読み込んだ名前は入力済みのキャラクターの後ろに足す（同じ名前は足さない）
  const onImport = (names: string[]) => {
    const current = parseNames(getValues('charactersStr'));
    const added = names.filter((n) => !current.includes(n));
    setValue('charactersStr', [...current, ...added].join('\n'));
    const skipped = names.length - added.length;
    setImportMsg(`${added.length}件読み込みました${skipped ? `（入力済みの${skipped}件は除外）` : ''}。`);
  };

  const onSubmit = async (values: FormValues) => {
    const errors: string[] = [];
    const title = values.title.trim();
    const description = values.description.trim();
    const names = parseNames(values.charactersStr);
    if (!title) errors.push('タイトルは必須です。');
    if (title.length > 100) errors.push('タイトルは100文字以内にしてください。');
    if (description.length > 500) errors.push('説明文は500文字以内にしてください。');
    if (names.length < 2) errors.push('キャラクターは2キャラクター以上必須です。');
    if (names.length > MAX_CHARACTERS) errors.push(`キャラクターは${MAX_CHARACTERS}キャラクターまでです。`);
    if (errors.length > 0) {
      setErrorMsg(errors.join('\n'));
      return;
    }
    try {
      const id = await createThread(title, description, names);
      navigate(routes.thread(id));
    } catch {
      setErrorMsg('データベースへの書き込みに失敗しました。');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Typography component="h1" sx={{ fontSize: 20, fontWeight: 700, mb: 2 }}>
        新しいランクを作る
      </Typography>
      <TextField label="タイトル" fullWidth margin="dense" {...register('title')} />
      <TextField label="説明（任意）" fullWidth margin="dense" multiline minRows={2} {...register('description')} />
      <TextField
        label="キャラクター（1行に1つ）"
        fullWidth
        margin="dense"
        multiline
        minRows={8}
        helperText={importMsg || 'あとから追加することもできます。'}
        slotProps={{ inputLabel: { shrink: true } }}
        {...register('charactersStr')}
      />
      <ImportCandidates onImport={onImport} />
      {errorMsg && <ErrorMessage message={errorMsg} />}
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button type="submit" variant="contained" disabled={formState.isSubmitting}>
          作成
        </Button>
        <Button color="inherit" onClick={() => {
            if (!window.confirm('入力内容を消しますか？')) return;
            reset();
            setImportMsg('');
          }}>
          クリア
        </Button>
      </Box>
    </form>
  );
}
