import React from "react";
import { createGlobalStyle } from "styled-components";
const bodyBgColor = theme`colors.indigo.200`;
import tw, { GlobalStyles as BaseStyles } from "twin.macro";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

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
