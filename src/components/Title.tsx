import Head from "next/head";

import { APP_NAME } from "@/lib/config";

type TitleProps = {
  children: string;
};

export const Title = ({ children }: TitleProps): JSX.Element => (
  <Head>
    <title>
      {children} | {APP_NAME}
    </title>
  </Head>
);
