import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loading, { ErrorMessage } from '../components/Loading';
import ThreadHeader from '../components/ThreadHeader';
import RankBoard from '../components/RankBoard';
import VoteForm from '../components/VoteForm';
import AddCandidatesForm from '../components/AddCandidatesForm';
import { applyVote, applyVotes, pickPair } from '../rating';
import { fetchThread } from '../threads';
import { errorMessage } from '../errors';
import { useVoteQueue } from '../voteQueue';
import { absoluteUrl, routes } from '../routes';
import type { Thread } from '../types';

// ランクを移動したときに投票の溜まり具合などを持ち越さないよう、id ごとに作り直す
export default function ThreadPage() {
  const { id = '' } = useParams();
  return <ThreadView key={id} id={id} />;
}

function ThreadView({ id }: { id: string }) {
  // base はサーバーから受け取った最新の状態。画面にはまだ送っていない票を上乗せして表示する
  const [base, setBase] = useState<Thread | null>(null);
  const [pair, setPair] = useState<[string, string] | null>(null);
  const [error, setError] = useState('');
  const votes = useVoteQueue(id, setBase);

  const thread = useMemo(
    () => (base ? { ...base, characters: applyVotes(base.characters, votes.pending) } : null),
    [base, votes.pending],
  );

  useEffect(() => {
    fetchThread(id)
      .then((t) => {
        if (!t) return setError('キャラランクが見つかりません。');
        setBase(t);
        setPair(pickPair(t.characters));
      })
      .catch((e) => setError(errorMessage(e, '読み込み')));
  }, [id]);

  const onVote = (winner: string, loser: string) => {
    if (!thread) return;
    // 「わからない」はデータを書き換えず、次の組み合わせを出すだけ
    if (!winner) {
      setPair(pickPair(thread.characters));
      return;
    }
    votes.add(winner, loser);
    setPair(pickPair(applyVote(thread.characters, winner, loser)));
  };

  if (error) return <ErrorMessage message={error} />;
  if (!thread) return <Loading />;

  return (
    <>
      <ThreadHeader title={thread.title} description={thread.description} url={absoluteUrl(routes.thread(thread.id))} />
      <RankBoard thread={thread} />
      <VoteForm pair={pair} error={votes.error} onSubmit={onVote} />
      <AddCandidatesForm threadId={thread.id} onAdded={setBase} />
    </>
  );
}
