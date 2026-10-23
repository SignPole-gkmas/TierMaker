import type { Character } from './types';

export const INITIAL_RATING = 1500;
export const MAX_CHARACTERS = 300;

/**
 * 1 回の投票で勝者に加算し敗者から減算するレーティング差分。
 * 参照元と同じく、格上に勝つほど大きく動く Elo 風の簡易式。
 */
export const ratingDelta = (winnerRating: number, loserRating: number): number => {
  if (loserRating <= 0) return 0;
  const delta = Math.floor(30 + 0.1 * (loserRating - winnerRating));
  return Math.min(Math.max(delta, 0), 100, Math.floor(loserRating / 2));
};

export const applyVote = (characters: Character[], winner: string, loser: string): Character[] => {
  const w = characters.find((c) => c.name === winner);
  const l = characters.find((c) => c.name === loser);
  if (!w || !l) return characters;
  const delta = ratingDelta(w.rating, l.rating);
  return characters.map((c) =>
    c.name === winner ? { ...c, rating: c.rating + delta } : c.name === loser ? { ...c, rating: c.rating - delta } : c,
  );
};

/** 改行区切りの入力を、前後空白除去・空行除去・重複除去した名前リストにする */
export const parseNames = (text: string): string[] =>
  [...new Set(text.split('\n').map((s) => s.trim()))].filter((s) => s);

export type Rank = { label: string; characters: Character[] };

/** 最高レートを 10.0 点に正規化し、点数帯で S〜E ランクに振り分ける */
export const toRanks = (characters: Character[]): Rank[] => {
  if (characters.length === 0) return [];
  const max = Math.max(...characters.map((c) => c.rating));
  const scored = [...characters]
    .sort((a, b) => b.rating - a.rating)
    .map((c) => ({ ...c, rating: max > 0 ? Math.round((c.rating / max) * 100) / 10 : 0 }));
  const band = (label: string, lower: number, upper: number) => ({
    label,
    characters: scored.filter((c) => c.rating > lower && c.rating <= upper),
  });
  return [
    band('Sランク', 9, Infinity),
    band('Aランク', 8, 9),
    band('Bランク', 7, 8),
    band('Cランク', 6, 7),
    band('Dランク', 5, 6),
    band('Eランク', -Infinity, 5),
  ];
};

export const pickPair = (characters: Character[]): [string, string] | null => {
  if (characters.length < 2) return null;
  const i = Math.floor(Math.random() * characters.length);
  let j = Math.floor(Math.random() * (characters.length - 1));
  if (j >= i) j++;
  return [characters[i].name, characters[j].name];
};
