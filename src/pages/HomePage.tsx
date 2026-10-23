import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import Loading, { ErrorMessage, SectionTitle } from '../components/Loading';
import { fetchThreads } from '../threads';
import { routes } from '../routes';
import type { Thread } from '../types';

const useThreads = (orderByColumn: 'createdAt' | 'updatedAt', max: number) => {
  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    fetchThreads(orderByColumn, max)
      .then(setThreads)
      .catch(() => setError('キャラランクの読み込みに失敗しました。'));
  }, [orderByColumn, max]);
  return { threads, error };
};

function ThreadList({ threads }: { threads: Thread[] }) {
  if (threads.length === 0) {
    return <Box sx={{ fontSize: 14, color: 'text.secondary' }}>まだありません</Box>;
  }
  return (
    <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
      {threads.map((t) => (
        <Box
          component="li"
          key={t.id}
          sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}
        >
          <Box
            component={Link}
            to={routes.thread(t.id)}
            sx={{
              display: 'flex',
              gap: 2,
              py: 1.25,
              color: 'text.primary',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {t.title}
            </Box>
            <Box sx={{ flexShrink: 0, fontSize: 12, color: 'text.secondary', alignSelf: 'center' }}>
              {t.updatedAt ? formatDistanceToNow(t.updatedAt.toDate(), { addSuffix: true, locale: ja }) : ''}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function Section({ title, orderByColumn, max }: { title: string; orderByColumn: 'createdAt' | 'updatedAt'; max: number }) {
  const { threads, error } = useThreads(orderByColumn, max);
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      {error ? <ErrorMessage message={error} /> : threads ? <ThreadList threads={threads} /> : <Loading />}
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Section title="最近更新" orderByColumn="updatedAt" max={5} />
      <Section title="新着" orderByColumn="createdAt" max={30} />
    </>
  );
}
