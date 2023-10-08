import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="fr">
      <Head />
      <body className="antialiased bg-gray-light text-black font-sans">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
