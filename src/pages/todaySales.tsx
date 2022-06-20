import { createSSGHelpers } from "@trpc/react/ssg";
import type { GetServerSideProps } from "next";

import { SalesByDay } from "@/components/SalesByDay";
import { appRouter } from "@/pages/api/trpc/[trpc]";
import { createContext } from "@/server/context";
import type { DehydratedState } from "react-query";

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
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: await createContext(),
  });
  const date = getToday();
  await ssg.fetchQuery("salesByDay", date);
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};
