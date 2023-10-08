import { Title } from "@/components/Title";

import { Bookmarks } from "./Bookmarks";
import { SellNewItem } from "./SellNewItem";

export const Dashboard = (): JSX.Element => {
  return (
    <div className="flex items-start gap-lg flex-1 flex-wrap">
      <Title>Tableau de bord</Title>
      <Bookmarks />
      <div className="flex flex-col gap-lg flex-1">
        <SellNewItem />
      </div>
    </div>
  );
};
