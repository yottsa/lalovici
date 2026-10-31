/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_END_DATE?: string;
  readonly VITE_END_MESSAGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
