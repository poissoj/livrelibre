/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_FAVICON?: string;
}

// Required by typescript-eslint's type-aware rules: unlike vue-tsc, its TypeScript
// program does not resolve `.vue` imports on its own. Do not remove.
declare module "*.vue" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent;
  export default component;
}
