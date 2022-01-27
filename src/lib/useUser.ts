import { useEffect } from "react";
import router from "next/router";
import { trpc } from "@/utils/trpc";

export default function useUser({
  redirectTo = "",
  redirectIfFound = false,
} = {}) {
  const { data: user } = trpc.useQuery(["user"]);

  const isLoggedIn = user && user.role !== "anonymous";
  useEffect(() => {
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
  }, [user, redirectIfFound, redirectTo, isLoggedIn]);

  return { user, isLoggedIn };
}
