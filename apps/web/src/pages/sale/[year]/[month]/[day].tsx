import type { ReactElement } from "react";
import { useParams } from "react-router";

import { Restricted } from "@/components/Restricted";
import { SalesByDay } from "@/components/Sales/SalesByDay";

const SalesByDayPage = (): ReactElement | null => {
  const { day, month, year } = useParams();
  if (
    typeof day !== "string" ||
    typeof month !== "string" ||
    typeof year !== "string"
  ) {
    return null;
  }
  const date = `${year}-${month}-${day}`;
  return (
    <Restricted role="admin">
      <SalesByDay date={date} />
    </Restricted>
  );
};

export default SalesByDayPage;
