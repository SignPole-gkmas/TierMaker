import { useEffect, useState } from 'react';
import { onDisconnect, onValue, push, ref, remove, serverTimestamp, set } from 'firebase/database';
import { rtdb } from './firebase';

/**
 * サイトを開いている人数を返す。
 * 開いている間は presence/ に自分の印を置き、ページを閉じる・通信が切れると
 * Firebase 側が onDisconnect で自動的に消すので、presence/ の件数がそのまま人数になる。
 */
export const useOnlineCount = (): number | null => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!rtdb) return;
    const db = rtdb;
    const me = push(ref(db, 'presence'));
    let active = true;

    // 再接続のたびに印を置き直す（切断中に onDisconnect で消されているため）
    const unsubConnected = onValue(ref(db, '.info/connected'), async (snap) => {
      if (snap.val() !== true) return;
      await onDisconnect(me).remove();
      // 待っている間にページを離れていたら置かない（消し忘れの印が残るのを防ぐ）
      if (active) set(me, serverTimestamp());
    });
    const unsubCount = onValue(ref(db, 'presence'), (snap) => setCount(snap.size));

    return () => {
      active = false;
      unsubConnected();
      unsubCount();
      onDisconnect(me).cancel();
      remove(me);
    };
  }, []);

  return count;
};
