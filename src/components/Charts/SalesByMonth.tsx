import type { InferQueryOutput } from "@/utils/trpc";
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";

type Sales = InferQueryOutput<"lastSales">;

/* Don't display 0 for empty columns, they appear on top of labels */
const formatter = (n: number) => (n ? n : "");

const labelFormatter = (_label: string, payload: Payload<string, number>[]) => {
  const sale = payload[0]?.payload as Sales[number] | undefined;
  return sale?.fullMonthLabel;
};
const tooltipFormatter = (count: number) => [count, "ventes"];

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
