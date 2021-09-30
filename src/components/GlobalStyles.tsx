import React from "react";
import { createGlobalStyle } from "styled-components";
import tw, { GlobalStyles as BaseStyles } from "twin.macro";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

const CustomStyles = createGlobalStyle`
  html, body, #__next {
    height: 100%;
  }
  body {
    ${tw`antialiased bg-gray-light text-gray-dark font-sans`}
  }
`;

const GlobalStyles = (): JSX.Element => (
  <>
    <BaseStyles />
    <CustomStyles />
  </>
);

export default GlobalStyles;
