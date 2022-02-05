import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { createGlobalStyle } from "styled-components";
import tw, { GlobalStyles as BaseStyles } from "twin.macro";

config.autoAddCss = false;

const CustomStyles = createGlobalStyle`
  html, body, #__next {
    height: 100%;
  }
  body {
    ${tw`antialiased bg-gray-light text-black font-sans`}
  }
  @font-face {
    font-family: 'Niconne';
    font-style: normal;
    font-weight: 400;
    src: url(/fonts/Niconne.woff2) format('woff2');
    font-display: fallback;
  }
`;

const GlobalStyles = (): JSX.Element => (
  <>
    <BaseStyles />
    <CustomStyles />
  </>
);

export default GlobalStyles;
