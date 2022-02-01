import "twin.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartPlus,
  faShoppingCart,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { trpc } from "@/utils/trpc";
import type { Bookmark } from "@/server/bookmarks";

export const AddToCartButton = ({ item }: { item: Bookmark }) => {
  const utils = trpc.useContext();
  const { mutate, isLoading } = trpc.useMutation("addToCart", {
    async onSuccess() {
      await Promise.all([
        utils.invalidateQueries("cart"),
        utils.invalidateQueries("bookmarks"),
      ]);
    },
  });
  let icon = item.amount > 0 ? faCartPlus : faShoppingCart;
  if (isLoading) {
    icon = faSpinner;
  }
  return (
    <button
      tw="p-xs mr-xs disabled:(cursor-not-allowed opacity-80) hover:text-primary-darkest"
      name="Ajouter au panier"
      title="Ajouter au panier"
      type="button"
      onClick={() => mutate(item._id)}
      disabled={item.amount === 0}
    >
      <FontAwesomeIcon icon={icon} spin={isLoading} />
    </button>
  );
};
