import { createSSGHelpers } from "@trpc/react/ssg";
import type { GetStaticProps } from "next";

import { SalesByDay } from "@/components/SalesByDay";
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

export const getStaticProps: GetStaticProps = async () => {
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
    revalidate: 1,
  };
};