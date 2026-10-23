import type { Timestamp } from 'firebase/firestore';

export type Character = {
  name: string;
  rating: number;
};

/** Firestore の threads コレクションの 1 ドキュメント（= 1 つのキャラランク） */
export type ThreadData = {
  title: string;
  description: string;
  characters: Character[];
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type Thread = ThreadData & { id: string };
