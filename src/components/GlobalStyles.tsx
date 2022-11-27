import { Global, css } from "@emotion/react";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "react-toastify/dist/ReactToastify.css";
import tw, { GlobalStyles as BaseStyles } from "twin.macro";

config.autoAddCss = false;

const customStyles = css`
  html,
  body,
  #__next {
    height: 100%;
  }
  body {
    ${tw`antialiased bg-gray-light text-black font-sans`}
  }
  @font-face {
    font-family: "Niconne";
    font-style: normal;
    font-weight: 400;
    src: url(/fonts/Niconne.woff2) format("woff2");
    font-display: fallback;
  }
  @font-face {
    font-family: "Roboto Mono";
    font-style: normal;
    font-weight: regular;
    src: url(/fonts/Roboto-Mono.woff2) format("woff2");
    font-display: fallback;
  }
  .Toastify {
    --toastify-color-success: #008073;
  }
`;

const GlobalStyles = (): JSX.Element => (
  <>
    <BaseStyles />
    <Global styles={customStyles} />
  </>
);

export default GlobalStyles;
