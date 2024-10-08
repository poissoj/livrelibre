import type { ReactElement } from "react";

import { SalesByDay } from "@/components/Sales/SalesByDay";

const getToday = () => {
  // We always want day/month/year regardless of the current locale
  return new Date().toLocaleDateString("fr");
};

const SalesByDayPage = (): ReactElement | null => {
  const date = getToday();
  return <SalesByDay date={date} />;
};

export default SalesByDayPage;
