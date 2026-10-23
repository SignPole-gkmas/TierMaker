import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from './errors';
import { sendVotes } from './threads';
import type { Vote } from './rating';
import type { Thread } from './types';

/** この票数が溜まるか、最初の票からこの時間が経ったらまとめて送る */
const SEND_COUNT = 5;
const SEND_DELAY_MS = 10_000;
/** 送信に失敗したら、この時間をおいてから送り直す */
const RETRY_DELAY_MS = 30_000;
/** 送れないまま溜め込みすぎないための上限 */
const MAX_PENDING = 100;

const storageKey = (id: string) => `tiermaker:pendingVotes:${id}`;

const loadVotes = (id: string): Vote[] => {
  try {
    return JSON.parse(localStorage.getItem(storageKey(id)) ?? '[]') as Vote[];
  } catch {
    return [];
  }
};

const saveVotes = (id: string, votes: Vote[]) => {
  try {
    if (votes.length) localStorage.setItem(storageKey(id), JSON.stringify(votes));
    else localStorage.removeItem(storageKey(id));
  } catch {
    // 保存できなくても、ページを開いている間は送れる
  }
}

/**
 * 投票を 1 票ずつ書き込まず、溜めてまとめて送る（書き込み・読み取り回数を約 1/SEND_COUNT にする）。
 * 未送信の票はブラウザに保存しておき、ページを閉じても次にこのランクを開いたときに送る。
 * pending（送信待ち＋送信中の票）は画面表示に上乗せして、投票結果がすぐ見えるようにする。
 */
export const useVoteQueue = (id: string, onSent: (thread: Thread) => void) => {
  const queued = useRef<Vote[]>([]);
  const sending = useRef<Vote[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const waitingRetry = useRef(false);
  const onSentRef = useRef(onSent);
  onSentRef.current = onSent;
  const [pending, setPending] = useState<Vote[]>([]);
  const [error, setError] = useState('');

  const update = useCallback(() => {
    setPending([...sending.current, ...queued.current]);
    saveVotes(id, queued.current);
  }, [id]);

  const schedule = useCallback((ms: number, run: () => void) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = undefined;
      run();
    }, ms);
  }, []);

  const send = useCallback(async () => {
    if (sending.current.length > 0 || queued.current.length === 0) return;
    clearTimeout(timer.current);
    timer.current = undefined;
    sending.current = queued.current;
    queued.current = [];
    update();
    try {
      const thread = await sendVotes(id, sending.current);
      sending.current = [];
      setError('');
      onSentRef.current(thread);
    } catch (e) {
      queued.current = [...sending.current, ...queued.current].slice(-MAX_PENDING);
      sending.current = [];
      setError(errorMessage(e, '投票の送信') + '（投票はこの端末に保存し、あとで自動で送り直します）');
      waitingRetry.current = true;
      schedule(RETRY_DELAY_MS, () => {
        waitingRetry.current = false;
        send();
      });
    }
    update();
    // 送信中に溜まった票の扱い
    if (!waitingRetry.current) {
      if (queued.current.length >= SEND_COUNT) send();
      else if (queued.current.length > 0 && !timer.current) schedule(SEND_DELAY_MS, send);
    }
  }, [id, update, schedule]);

  const add = useCallback(
    (winner: string, loser: string) => {
      queued.current = [...queued.current, { winner, loser }].slice(-MAX_PENDING);
      update();
      if (waitingRetry.current) return;
      if (queued.current.length >= SEND_COUNT) send();
      else if (!timer.current) schedule(SEND_DELAY_MS, send);
    },
    [update, send, schedule],
  );

  useEffect(() => {
    // 前回送れなかった票があれば、開いた時点で送る
    queued.current = loadVotes(id);
    update();
    if (queued.current.length) send();
    // ページを離れるときは残りを送る（アプリ内の移動ならそのまま送信が続く）
    return () => {
      clearTimeout(timer.current);
      timer.current = undefined;
      waitingRetry.current = false;
      send();
    };
  }, [id, update, send]);

  return { pending, error, add };
};
