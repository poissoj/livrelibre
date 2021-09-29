import React from "react";
import { createGlobalStyle } from "styled-components";
import tw, { theme, GlobalStyles as BaseStyles } from "twin.macro";

const bodyBgColor = theme`colors.indigo.200`;

const CustomStyles = createGlobalStyle`
  body {
    background-color: ${bodyBgColor};
    ${tw`antialiased`}
  }
`;

const GlobalStyles = (): JSX.Element => (
  <>
    <BaseStyles />
    <CustomStyles />
  </>
);

export default GlobalStyles;
