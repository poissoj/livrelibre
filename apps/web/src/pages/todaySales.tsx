import type { ReactElement } from "react";

import { formatDate } from "@livrelibre/shared/date";

import { SalesByDay } from "@/components/Sales/SalesByDay";

const getToday = () => formatDate(new Date());

const SalesByDayPage = (): ReactElement | null => {
  const date = getToday();
  return <SalesByDay date={date} />;
};

export default SalesByDayPage;
