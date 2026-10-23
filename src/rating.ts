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

/**
 * レートの値で固定の帯に振り分ける。平均（初期レート 1500）が B と C の境目になる。
 * 1 位を 10 点とする比率方式だと平均付近に全員が集まり D・E が埋まらないため、この方式にしている。
 */
export const RANK_BANDS = [
  { label: 'Sランク', min: 1700 },
  { label: 'Aランク', min: 1600 },
  { label: 'Bランク', min: 1500 },
  { label: 'Cランク', min: 1400 },
  { label: 'Dランク', min: 1300 },
  { label: 'Eランク', min: -Infinity },
];

export const toRanks = (characters: Character[]): Rank[] => {
  if (characters.length === 0) return [];
  const sorted = [...characters].sort((a, b) => b.rating - a.rating);
  return RANK_BANDS.map((band, i) => {
    const upper = i === 0 ? Infinity : RANK_BANDS[i - 1].min;
    return { label: band.label, characters: sorted.filter((c) => c.rating >= band.min && c.rating < upper) };
  });
};

/** この差で選ばれやすさが半分になる。小さいほどレートの近い相手に偏る */
const MATCH_SCALE = 100;

/**
 * 1 人目は完全ランダム、2 人目はレートが近いほど選ばれやすい重み付きランダムで選ぶ。
 * 重みは差が開くほどなだらかに下がるだけで 0 にはならないため、格差のある対戦もときどき起きる。
 */
export const pickPair = (characters: Character[]): [string, string] | null => {
  if (characters.length < 2) return null;
  const first = characters[Math.floor(Math.random() * characters.length)];
  const others = characters.filter((c) => c !== first);
  const weights = others.map((c) => 1 / (1 + ((c.rating - first.rating) / MATCH_SCALE) ** 2));
  let t = Math.random() * weights.reduce((a, b) => a + b, 0);
  const second = others.find((_, i) => (t -= weights[i]) < 0) ?? others[others.length - 1];
  return Math.random() < 0.5 ? [first.name, second.name] : [second.name, first.name];
};
