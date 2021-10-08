import { getBookmarks } from "@/server/bookmarks";
import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";

const appRouter = trpc.router().query("bookmarks", {
  async resolve() {
    const bookmarks = await getBookmarks();
    return bookmarks;
  },
});

// export type definition of API
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => null,
});
