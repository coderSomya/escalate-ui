/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ESCALATE_CONTRACT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  WeilWallet?: any
}

