export const SITE_NAME = 'みんなのTierMaker';

export const routes = {
  home: '/',
  addThread: '/addThread',
  thread: (id: string) => `/thread/${id}`,
};

/** 共有用の絶対 URL（HashRouter なので # 以降にパスが入る） */
export const absoluteUrl = (path: string) =>
  `${window.location.origin}${window.location.pathname}#${path}`;
