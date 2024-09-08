import Head from "next/head";
import type { ReactElement } from "react";

import { APP_NAME } from "@/lib/config";

type TitleProps = {
  children: string;
};

export const Title = ({ children }: TitleProps): ReactElement => {
  const title = `${children} | ${APP_NAME}`;
  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
};
