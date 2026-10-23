import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { INITIAL_RATING, MAX_CHARACTERS, applyVote } from './rating';
import type { Character, Thread, ThreadData } from './types';

const THREADS = 'threads';

const toThread = (id: string, data: ThreadData): Thread => ({ ...data, id });

export const fetchThreads = async (orderByColumn: 'createdAt' | 'updatedAt', max: number): Promise<Thread[]> => {
  const snap = await getDocs(query(collection(db, THREADS), orderBy(orderByColumn, 'desc'), limit(max)));
  return snap.docs.map((d) => toThread(d.id, d.data() as ThreadData));
};

export const fetchThread = async (id: string): Promise<Thread | null> => {
  const snap = await getDoc(doc(db, THREADS, id));
  return snap.exists() ? toThread(snap.id, snap.data() as ThreadData) : null;
};

export const createThread = async (title: string, description: string, names: string[]): Promise<string> => {
  const ref = await addDoc(collection(db, THREADS), {
    title,
    description,
    characters: names.map((name): Character => ({ name, rating: INITIAL_RATING })),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

/**
 * 投票を反映する。参照元は get → update だったが、同時投票で結果が
 * 上書きされないようトランザクションで読み書きする。
 */
export const vote = (id: string, winner: string, loser: string): Promise<Thread> =>
  runTransaction(db, async (tx) => {
    const ref = doc(db, THREADS, id);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('キャラランクが見つかりません。');
    const data = snap.data() as ThreadData;
    const characters = applyVote(data.characters, winner, loser);
    tx.update(ref, { characters, updatedAt: serverTimestamp() });
    return toThread(id, { ...data, characters });
  });

export type AddCandidatesResult = { thread: Thread; added: string[]; skipped: string[] };

/** 既存のキャラランクに回答候補を追加する。既に存在する名前はスキップする。 */
export const addCandidates = (id: string, names: string[]): Promise<AddCandidatesResult> =>
  runTransaction(db, async (tx) => {
    const ref = doc(db, THREADS, id);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('キャラランクが見つかりません。');
    const data = snap.data() as ThreadData;
    const existing = new Set(data.characters.map((c) => c.name));
    const added = names.filter((n) => !existing.has(n));
    const skipped = names.filter((n) => existing.has(n));
    if (data.characters.length + added.length > MAX_CHARACTERS) {
      throw new Error(`回答候補は合計${MAX_CHARACTERS}件までです。`);
    }
    if (added.length === 0) return { thread: toThread(id, data), added, skipped };

    // 新しい候補は初期レートで参加する。投票はレートの総和を保つため、1500 は常に平均値になる。
    const characters = [...data.characters, ...added.map((name) => ({ name, rating: INITIAL_RATING }))];
    tx.update(ref, { characters, updatedAt: serverTimestamp() });
    return { thread: toThread(id, { ...data, characters }), added, skipped };
  });
