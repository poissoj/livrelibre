import { useEffect } from "react";
import { useNavigate } from "react-router";

import { trpc } from "@/utils/trpc";

export default function useUser({
  redirectTo = "",
  redirectIfFound = false,
}: { redirectTo?: string; redirectIfFound?: boolean } = {}) {
  const navigate = useNavigate();
  const {
    data: user,
    isPending,
    isError,
  } = trpc.user.useQuery(undefined, { retry: 1 });

  const isLoggedIn = user !== undefined && user.role !== "anonymous";

  useEffect(() => {
    if (!redirectTo || isPending || isError) return;

    if (
      (!redirectIfFound && !isLoggedIn) ||
      (redirectIfFound && isLoggedIn)
    ) {
      void navigate(redirectTo, { replace: true });
    }
  }, [isPending, isError, isLoggedIn, redirectIfFound, redirectTo, navigate]);

  return { user, isLoggedIn, isPending, isError };
}
