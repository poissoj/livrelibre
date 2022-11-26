import type { DehydratedState } from "@tanstack/react-query";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type { GetServerSideProps } from "next";

import { Dashboard } from "@/components/Dashboard/Dashboard";
import { appRouter } from "@/pages/api/trpc/[trpc]";
import { createContext } from "@/server/context";

export default Dashboard;

export const getServerSideProps: GetServerSideProps<{
  trpcState: DehydratedState;
}> = async () => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(),
  });
  await ssg.bookmarks.prefetch();
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};
