import { Dashboard } from "@/components/Dashboard/Dashboard";
import { GetStaticPropsResult } from "next";
import { createSSGHelpers } from "@trpc/react/ssg";
import { appRouter } from "@/pages/api/trpc/[trpc]";
import { DehydratedState } from "react-query";

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
    revalidate: 600,
  };
};
