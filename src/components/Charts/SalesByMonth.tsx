import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type {
  Formatter,
  Payload,
} from "recharts/types/component/DefaultTooltipContent";

import type { RouterOutput } from "@/utils/trpc";

type Sales = RouterOutput["lastSales"];

/* Don't display 0 for empty columns, they appear on top of labels */
const formatter = (n: number) => (n ? n : "");

const labelFormatter = (_label: string, payload: Payload<number, string>[]) => {
  const sale = payload[0]?.payload as Sales[number] | undefined;
  return sale?.fullMonthLabel;
};
const tooltipFormatter: Formatter<number, string> = (count: number) => [
  count,
  "ventes",
];

const SalesByMonth = ({ sales }: { sales: Sales }) => (
  <ResponsiveContainer height={350} width="100%">
    <BarChart data={sales}>
      <XAxis dataKey="monthLabel" />
      <Tooltip labelFormatter={labelFormatter} formatter={tooltipFormatter} />
      <Bar dataKey="count" fill="steelblue" isAnimationActive={false}>
        <LabelList
          dataKey="count"
          position="insideTop"
          fill="white"
          formatter={formatter}
        />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export default SalesByMonth;
