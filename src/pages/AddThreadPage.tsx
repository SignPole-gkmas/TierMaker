import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography } from '@mui/material';
import { ErrorMessage } from '../components/Loading';
import { MAX_CHARACTERS, parseNames } from '../rating';
import { createThread } from '../threads';
import { routes } from '../routes';

type FormValues = { title: string; description: string; charactersStr: string };

const defaultValues: FormValues = { title: '', description: '', charactersStr: '' };

export default function AddThreadPage() {
  const { register, reset, handleSubmit, formState } = useForm<FormValues>({ defaultValues });
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

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
        helperText="あとから追加することもできます。"
        {...register('charactersStr')}
      />
      {errorMsg && <ErrorMessage message={errorMsg} />}
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button type="submit" variant="contained" disabled={formState.isSubmitting}>
          作成
        </Button>
        <Button color="inherit" onClick={() => window.confirm('入力内容を消しますか？') && reset()}>
          クリア
        </Button>
      </Box>
    </form>
  );
}
