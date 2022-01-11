import { Dashboard } from "@/components/Dashboard/Dashboard";
import { createSSGHelpers } from "@trpc/react/ssg";
import type { GetStaticPropsResult } from "next";
import type { DehydratedState } from "react-query";
import { appRouter } from "@/pages/api/trpc/[trpc]";

export default Dashboard;

export const getStaticProps = async (): Promise<
  GetStaticPropsResult<{ trpcState: DehydratedState }>
> => {
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: {},
  });
  await ssg.fetchQuery("bookmarks");
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 10,
  };
};
