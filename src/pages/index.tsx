import { createSSGHelpers } from "@trpc/react/ssg";
import type { GetServerSideProps } from "next";
import type { DehydratedState } from "react-query";

import { Dashboard } from "@/components/Dashboard/Dashboard";
import { appRouter } from "@/pages/api/trpc/[trpc]";
import { createContext } from "@/server/context";

export default Dashboard;

export const getServerSideProps: GetServerSideProps<{
  trpcState: DehydratedState;
}> = async () => {
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: await createContext(),
  });
  await ssg.fetchQuery("bookmarks");
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};
