import { useParams } from "react-router";

export const ListingItem = () => {
  const { cardId } = useParams();
  return (
    <div>
      <h1>Listing Item {cardId}</h1>
    </div>
  );
};
