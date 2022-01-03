import { Title } from "@/components/Title";
import { SellNewItem } from "./SellNewItem";
import { Bookmarks } from "./Bookmarks";
import "twin.macro";

export const Dashboard = (): JSX.Element => {
  return (
    <div tw="flex align-items[flex-start] gap-lg flex-1 flex-wrap">
      <Title>Tableau de bord</Title>
      <Bookmarks />
      <div tw="flex flex-col gap-lg flex-1">
        <SellNewItem />
      </div>
    </div>
  );
};
