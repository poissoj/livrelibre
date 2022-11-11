import Link from "next/link";
import "twin.macro";

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
}: BookmarksContentProps): JSX.Element => {
  return (
    <ul tw="flex-1">
      {bookmarks.map((bookmark) => (
        <li
          key={bookmark._id}
          tw="flex text-primary-dark hover:bg-gray-light pl-sm pr-xs"
        >
          <span tw="flex flex-1 items-center text-primary-darkest">
            <Link href={`/item/${bookmark._id}`} legacyBehavior>
              {bookmark.title}
            </Link>
          </span>
          <AddToCartButton item={bookmark} />
        </li>
      ))}
    </ul>
  );
};

const BookmarksLoader = (): JSX.Element | null => {
  const result = trpc.useQuery(["bookmarks"]);
  if (result.status === "error") {
    return <ErrorMessage />;
  }
  if (result.status === "loading") {
    return <BookmarksSkeleton />;
  }
  if (result.status === "idle") {
    return null;
  }
  return <BookmarksContent bookmarks={result.data} />;
};

export const Bookmarks = (): JSX.Element => (
  <Card tw="flex-1 max-h-full overflow-hidden flex flex-col [min-width:24rem]">
    <CardTitle>Favoris</CardTitle>
    <CardBody>
      <BookmarksLoader />
    </CardBody>
  </Card>
);
