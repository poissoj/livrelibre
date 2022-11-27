import type { CSSInterpolation } from "@emotion/css";
import { css as cssImport } from "@emotion/react";
import styledImport from "@emotion/styled";
import "twin.macro";

declare module "twin.macro" {
  // The styled and css imports
  const styled: typeof styledImport;
  const css: typeof cssImport;
}

declare module "react" {
  // The tw and css prop
  interface DOMAttributes {
    tw?: string;
    css?: CSSInterpolation;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicAttributes<T> extends DOMAttributes<T> {
      as?: string | Element;
    }
  }
}
