import Head from "next/head";

import { APP_NAME } from "@/lib/config";

type TitleProps = {
  children: string;
};

export const Title = ({ children }: TitleProps): JSX.Element => {
  const title = `${children} | ${APP_NAME}`;
  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
};
