import { createSSGHelpers } from "@trpc/react/ssg";
import type { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";

import { SalesByDay } from "@/components/SalesByDay";
import { appRouter } from "@/pages/api/trpc/[trpc]";
import { createContext } from "@/server/context";

const SalesByDayPage = (): JSX.Element | null => {
  const router = useRouter();
  const { day, month, year } = router.query;
  if (
    typeof day !== "string" ||
    typeof month !== "string" ||
    typeof year !== "string"
  ) {
    return null;
  }
  const date = `${day}/${month}/${year}`;
  return <SalesByDay date={date} />;
};

export default SalesByDayPage;

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: await createContext(),
  });
  const year = context.params?.year;
  const month = context.params?.month;
  const day = context.params?.day;
  if (
    typeof year === "string" &&
    typeof month === "string" &&
    typeof day === "string"
  ) {
    const date = `${day}/${month}/${year}`;
    await ssg.fetchQuery("salesByDay", date);
  }
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};
