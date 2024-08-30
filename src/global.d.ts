declare global {
  type Recordable<T = any> = Record<string, T>;
  declare interface ImportMetaEnv {
    VITE_BASE_URL;
  }
}

export {};
