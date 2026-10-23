import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loading, { ErrorMessage } from '../components/Loading';
import ThreadHeader from '../components/ThreadHeader';
import RankBoard from '../components/RankBoard';
import VoteForm from '../components/VoteForm';
import AddCandidatesForm from '../components/AddCandidatesForm';
import { pickPair } from '../rating';
import { fetchThread, vote } from '../threads';
import { absoluteUrl, routes } from '../routes';
import type { Thread } from '../types';

export default function ThreadPage() {
  const { id = '' } = useParams();
  const [thread, setThread] = useState<Thread | null>(null);
  const [pair, setPair] = useState<[string, string] | null>(null);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  const show = (t: Thread) => {
    setThread(t);
    setPair(pickPair(t.characters));
  };

  useEffect(() => {
    fetchThread(id)
      .then((t) => (t ? show(t) : setError('キャラランクが見つかりません。')))
      .catch(() => setError('キャラランクの読み込みに失敗しました。'));
  }, [id]);

  const onVote = async (winner: string, loser: string) => {
    if (!thread) return;
    // 「わからない」はデータを書き換えず、次の組み合わせを出すだけ
    if (!winner) {
      setPair(pickPair(thread.characters));
      return;
    }
    setVoting(true);
    try {
      show(await vote(id, winner, loser));
    } catch {
      setError('投票の書き込みに失敗しました。');
    } finally {
      setVoting(false);
    }
  };

  if (error) return <ErrorMessage message={error} />;
  if (!thread) return <Loading />;

  return (
    <>
      <ThreadHeader title={thread.title} description={thread.description} url={absoluteUrl(routes.thread(thread.id))} />
      <RankBoard thread={thread} />
      <VoteForm pair={pair} disabled={voting} onSubmit={onVote} />
      <AddCandidatesForm threadId={thread.id} onAdded={show} />
    </>
  );
}
