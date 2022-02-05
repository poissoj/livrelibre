import {
  faCartPlus,
  faShoppingCart,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "twin.macro";

import type { Bookmark } from "@/server/bookmarks";
import { useAddToCart } from "@/utils/useAddToCart";

export const AddToCartButton = ({
  item,
  className,
}: {
  item: Bookmark;
  className?: string;
}) => {
  let icon = item.amount > 0 ? faCartPlus : faShoppingCart;
  const { mutate, isLoading } = useAddToCart();
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
      className={className}
    >
      <FontAwesomeIcon icon={icon} spin={isLoading} />
    </button>
  );
};
