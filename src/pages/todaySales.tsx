import type { DehydratedState } from "@tanstack/react-query";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type { GetServerSideProps } from "next";

import { SalesByDay } from "@/components/Sales/SalesByDay";
import { appRouter } from "@/pages/api/trpc/[trpc]";
import { createContext } from "@/server/context";

const getToday = () => {
  // We always want day/month/year regardless of the current locale
  return new Date().toLocaleDateString("fr");
};

const SalesByDayPage = (): JSX.Element | null => {
  const date = getToday();
  return <SalesByDay date={date} />;
};

export default SalesByDayPage;

export const getServerSideProps: GetServerSideProps<{
  trpcState: DehydratedState;
}> = async () => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(),
  });
  const date = getToday();
  await ssg.salesByDay.prefetch(date);
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};
