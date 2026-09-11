import { useEffect } from "react";
import { useNavigate } from "react-router";

import { trpc } from "@/utils/trpc";

export default function useUser({
  redirectTo = "",
  redirectIfFound = false,
} = {}) {
  const navigate = useNavigate();
  const { data: user } = trpc.user.useQuery(undefined, { retry: 1 });

  const isLoggedIn = user && user.role !== "anonymous";
  useEffect(() => {
    if (!redirectTo || !user) return;

    if (
      (redirectTo && !redirectIfFound && !isLoggedIn) ||
      (redirectIfFound && isLoggedIn)
    ) {
      void navigate(redirectTo);
    }
  }, [user, redirectIfFound, redirectTo, isLoggedIn, navigate]);

  return { user, isLoggedIn };
}
