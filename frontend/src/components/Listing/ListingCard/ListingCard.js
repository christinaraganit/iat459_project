import "./ListingCard.css";
import { Fragment } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { Button } from "../../Button/Button";
import { LinkButton } from "../../LinkButton/LinkButton";

function ListingCard({
  seller,
  price,
  condition,
  image,
  cardId,
  cardName,
  id,
}) {
  const { user } = useAuthContext();

  return (
    <LinkButton to={`/listings/${id}`} className="card" variant="tertiary">
      {image ? (
        <img className="card__img" src={image} alt={cardId} />
      ) : (
        <div className="card__img_placeholder" />
      )}
    </LinkButton>
  );
}

const Info = ({ seller, price, condition, cardName }) => (
  <Fragment>
    <div className="card__info">
      <h2>{cardName}</h2>
      <p>Condition: {condition}</p>
      <p>Price: ${price.toFixed(2)}</p>
      {seller !== null ? (
        <p>Seller: {seller.displayName || seller.username}</p>
      ) : (
        <Fragment>
          <p>Unavailable Account</p>
          <Button
            variant="tertiary"
            className="listing-card__report"
            onClick={() => {}}
          >
            Report listing
          </Button>
        </Fragment>
      )}
      {/* {user && seller !== null && <button>Send Interest</button>} */}
    </div>
  </Fragment>
);

export default ListingCard;
