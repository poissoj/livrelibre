import Link from "next/link";
import type { ReactElement } from "react";

import { AddToCartButton } from "@/components/AddToCartButton";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import type { Bookmark } from "@/server/bookmarks";
import { trpc } from "@/utils/trpc";

import { BookmarksSkeleton } from "./BookmarksSkeleton";

type BookmarksContentProps = {
  bookmarks: Bookmark[];
};

const BookmarksContent = ({
  bookmarks,
}: BookmarksContentProps): ReactElement => {
  return (
    <ul className="flex-1">
      {bookmarks.map((bookmark) => (
        <li
          key={bookmark.id}
          className="flex text-primary-dark hover:bg-gray-light pl-sm pr-xs"
        >
          <span className="flex flex-1 items-center text-primary-darkest">
            <Link href={`/item/${bookmark.id}`}>{bookmark.title}</Link>
          </span>
          <AddToCartButton item={bookmark} />
        </li>
      ))}
    </ul>
  );
};

const BookmarksLoader = (): ReactElement | null => {
  const result = trpc.bookmarks.useQuery();
  if (result.status === "error") {
    return <ErrorMessage />;
  }
  if (result.status === "loading") {
    return <BookmarksSkeleton />;
  }
  return <BookmarksContent bookmarks={result.data} />;
};

export const Bookmarks = (): ReactElement => (
  <Card className="flex-1 max-h-full overflow-hidden flex flex-col [min-width:24rem]">
    <CardTitle>Favoris</CardTitle>
    <CardBody>
      <BookmarksLoader />
    </CardBody>
  </Card>
);
