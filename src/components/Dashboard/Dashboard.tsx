import { Title } from "@/components/Title";
import { QuickSearch } from "./QuickSearch";
import { SellNewItem } from "./SellNewItem";
import { Bookmarks } from "./Bookmarks";
import "twin.macro";

export const Dashboard = (): JSX.Element => {
  return (
    <div tw="flex align-items[flex-start] gap-lg flex-1">
      <Title>Tableau de bord</Title>
      <Bookmarks />
      <div tw="flex flex-col gap-lg flex-1">
        <QuickSearch />
        <SellNewItem />
      </div>
    </div>
  );
};
