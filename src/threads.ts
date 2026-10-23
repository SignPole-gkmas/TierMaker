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
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { INITIAL_RATING, MAX_CHARACTERS, applyVotes, type Vote } from './rating';
import type { Character, Thread, ThreadData } from './types';

const THREADS = 'threads';

const toThread = (id: string, data: ThreadData): Thread => ({ ...data, id });

// トップページの一覧は開くたびに最大 35 件読み取るため、数分間ブラウザに覚えさせて読み取り回数を抑える
const LIST_CACHE_MS = 3 * 60 * 1000;
const LIST_CACHE_PREFIX = 'tiermaker:threads:';

type CachedThread = Omit<Thread, 'createdAt' | 'updatedAt'> & { createdAt: number | null; updatedAt: number | null };

const readListCache = (key: string): Thread[] | null => {
  try {
    const cached = JSON.parse(localStorage.getItem(key) ?? 'null') as { at: number; threads: CachedThread[] } | null;
    if (!cached || Date.now() - cached.at > LIST_CACHE_MS) return null;
    return cached.threads.map((t) => ({
      ...t,
      createdAt: t.createdAt === null ? null : Timestamp.fromMillis(t.createdAt),
      updatedAt: t.updatedAt === null ? null : Timestamp.fromMillis(t.updatedAt),
    }));
  } catch {
    return null;
  }
};

const writeListCache = (key: string, threads: Thread[]) => {
  try {
    const slim: CachedThread[] = threads.map((t) => ({
      ...t,
      characters: [], // 一覧では使わないので保存しない
      createdAt: t.createdAt?.toMillis() ?? null,
      updatedAt: t.updatedAt?.toMillis() ?? null,
    }));
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), threads: slim }));
  } catch {
    // 保存できなくても毎回読み取るだけなので無視する
  }
};

const clearListCache = () => {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(LIST_CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // 同上
  }
};

export const fetchThreads = async (orderByColumn: 'createdAt' | 'updatedAt', max: number): Promise<Thread[]> => {
  const key = `${LIST_CACHE_PREFIX}${orderByColumn}:${max}`;
  const cached = readListCache(key);
  if (cached) return cached;
  const snap = await getDocs(query(collection(db, THREADS), orderBy(orderByColumn, 'desc'), limit(max)));
  const threads = snap.docs.map((d) => toThread(d.id, d.data() as ThreadData));
  writeListCache(key, threads);
  return threads;
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
  clearListCache(); // 作ったランクがすぐ一覧に出るようにする
  return ref.id;
};

/**
 * 溜まった投票をまとめて 1 回の読み書きで反映する。同時投票で結果が
 * 上書きされないようトランザクションにし、最新のレートに対して順に適用する。
 */
export const sendVotes = (id: string, votes: Vote[]): Promise<Thread> =>
  runTransaction(db, async (tx) => {
    const ref = doc(db, THREADS, id);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('キャラランクが見つかりません。');
    const data = snap.data() as ThreadData;
    const characters = applyVotes(data.characters, votes);
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
