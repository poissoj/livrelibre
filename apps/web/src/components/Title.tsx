import { useEffect } from "react";

import { APP_NAME } from "@/lib/config";

type TitleProps = {
  children: string;
};

export const Title = ({ children }: TitleProps) => {
  useEffect(() => {
    document.title = `${children} | ${APP_NAME}`;
  }, [children]);
  return null;
};
