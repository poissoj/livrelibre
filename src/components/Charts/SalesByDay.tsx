import { Bar, BarChart, LabelList, XAxis } from "recharts";

const nf = Intl.NumberFormat();
const format = (node: React.ReactNode) =>
  typeof node === "number" ? nf.format(node) : node;

const SalesByDay = ({ days }: { days: { name: string; count: number }[] }) => (
  <BarChart data={days} width={800} height={300} id="sales-by-day-chart">
    <XAxis dataKey="name" />
    <Bar dataKey="count" fill="steelblue" isAnimationActive={false}>
      <LabelList
        dataKey="count"
        position="insideTop"
        fill="white"
        formatter={format}
      />
    </Bar>
  </BarChart>
);

export default SalesByDay;
