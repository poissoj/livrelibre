import clsx from "clsx";
import React from "react";

import { type OrderStatus, STATUS_COLOR, STATUS_LABEL } from "@/utils/order";

export const StatusCircle = (props: {
  status: OrderStatus;
  className?: string;
}) => {
  const className = clsx(
    "border border-black/60 rounded-xl w-5 h-5",
    STATUS_COLOR[props.status],
    props.className,
  );
  return <div className={className} title={STATUS_LABEL[props.status]} />;
};
