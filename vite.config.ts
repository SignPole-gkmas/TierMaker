import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages はリポジトリ名のサブパス (/<repo>/) で配信されるため、
// 相対パスでビルドしてどのパスに置いても動くようにする。
export default defineConfig({
  base: './',
  plugins: [react()],
});
