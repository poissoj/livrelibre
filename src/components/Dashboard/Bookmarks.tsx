import Link from "next/link";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faStar } from "@fortawesome/free-solid-svg-icons";
import "twin.macro";
import { trpc, useBookmark } from "@/utils/trpc";
import { ErrorMessage } from "@/components/ErrorMessage";
import type { Bookmark } from "@/server/bookmarks";
import { BookmarksSkeleton } from "./BookmarksSkeleton";

type BookmarksContentProps = {
  bookmarks: Bookmark[];
};

const BookmarksContent = ({
  bookmarks,
}: BookmarksContentProps): JSX.Element => {
  const { star } = useBookmark();
  return (
    <ul tw="flex-1">
      {bookmarks.map((bookmark) => (
        <li
          key={bookmark._id}
          tw="flex text-primary-dark hover:bg-gray-light pl-sm pr-xs"
        >
          <span tw="flex flex-1 align-items[center] text-primary-darkest">
            <Link href={`/item/${bookmark._id}`}>{bookmark.title}</Link>
          </span>
          <button
            tw="p-xs mr-xs"
            name="Ajouter au panier"
            title="Ajouter au panier"
            type="button"
          >
            <FontAwesomeIcon icon={faCartPlus} />
          </button>
          <button
            tw="p-xs"
            name="Enlever des favoris"
            title="Enlever des favoris"
            type="button"
            onClick={() => star(bookmark._id, false)}
          >
            <FontAwesomeIcon icon={faStar} />
          </button>
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
  <Card tw="flex-1 max-h-full overflow-hidden flex flex-col min-width[24rem]">
    <CardTitle>Favoris</CardTitle>
    <CardBody>
      <BookmarksLoader />
    </CardBody>
  </Card>
);
