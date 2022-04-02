import router from "next/router";
import { useEffect } from "react";

import { trpc } from "@/utils/trpc";

export default function useUser({
  redirectTo = "",
  redirectIfFound = false,
} = {}) {
  const { data: user, error } = trpc.useQuery(["user"], { retry: 1 });

  const isLoggedIn = user && user.role !== "anonymous";
  useEffect(() => {
    if (error?.data?.code === "UNAUTHORIZED") {
      void router.push(redirectTo);
    }

    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || !user) return;

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !isLoggedIn) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && isLoggedIn)
    ) {
      void router.push(redirectTo);
    }
  }, [user, redirectIfFound, redirectTo, isLoggedIn, error?.data?.code]);

  return { user, isLoggedIn };
}
