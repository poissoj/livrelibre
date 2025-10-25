import { Bar, BarChart, LabelList, XAxis } from "recharts";

const nf = Intl.NumberFormat();
const format = (node: React.ReactNode) =>
  typeof node === "number" ? nf.format(node) : node;

const SalesByHour = ({
  hours,
}: {
  hours: { hour: number; count: number }[];
}) => (
  <BarChart
    data={hours}
    width={900}
    height={320}
    margin={{ left: 10, right: 15 }}
    id="sales-by-hour-chart"
  >
    <XAxis
      dataKey="hour"
      scale="linear"
      tickFormatter={(hour: number) => `${hour}h`}
      interval={0}
    />
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

export default SalesByHour;
