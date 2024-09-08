import { useRouter } from "next/router";
import type { ReactElement } from "react";

import { Restricted } from "@/components/Restricted";
import { SalesByDay } from "@/components/Sales/SalesByDay";

const SalesByDayPage = (): ReactElement | null => {
  const router = useRouter();
  const { day, month, year } = router.query;
  if (
    typeof day !== "string" ||
    typeof month !== "string" ||
    typeof year !== "string"
  ) {
    return null;
  }
  const date = `${day}/${month}/${year}`;
  return (
    <Restricted role="admin">
      <SalesByDay date={date} />
    </Restricted>
  );
};

export default SalesByDayPage;
