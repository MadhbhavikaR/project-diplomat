export type ViteEnv = Record<string, string | boolean | undefined>

declare global {
  // eslint-disable-next-line no-var
  var __VITE_ENV__:
    | {
        [key: string]: string | boolean | undefined
      }
    | undefined
}

export const getViteEnv = (): ViteEnv => {
  if (typeof globalThis !== 'undefined' && (globalThis as typeof globalThis).__VITE_ENV__) {
    return (globalThis as typeof globalThis).__VITE_ENV__ as ViteEnv
  }

  if (typeof process !== 'undefined' && process.env) {
    return process.env as ViteEnv
  }

  return {}
}
