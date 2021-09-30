import Head from "next/head";

type TitleProps = {
  children: string;
};

export const Title = ({ children }: TitleProps): JSX.Element => (
  <Head>
    <title>
      {children} | {process.env.NEXT_PUBLIC_APP_NAME}
    </title>
  </Head>
);
