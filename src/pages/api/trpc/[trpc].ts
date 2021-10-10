import { getBookmarks } from "@/server/bookmarks";
import { getItem } from "@/server/searchItem";
import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { z } from "zod";

const appRouter = trpc
  .router()
  .query("bookmarks", {
    async resolve() {
      return await getBookmarks();
    },
  })
  .query("searchItem", {
    input: z.string().length(24),
    async resolve({ input }) {
      return await getItem(input);
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => null,
});
