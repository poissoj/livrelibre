import useUser from "@/lib/useUser";

import { Alert } from "./Alert";

export const Restricted = ({
  role,
  children,
}: {
  role: string;
  children: JSX.Element;
}) => {
  const { user } = useUser();
  if (user?.role !== role) {
    return (
      <div>
        <Alert type="warning">
          Vous n&rsquo;êtes pas autorisé à accéder à cette partie.
        </Alert>
      </div>
    );
  }
  return children;
};
