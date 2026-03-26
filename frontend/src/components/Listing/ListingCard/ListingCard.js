import "./ListingCard.css";
import { Fragment, Suspense } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "../../Button/Button";

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
    <Link to={`/listings/${id}`} className="card">
      <Suspense fallback={<div className="card__img_placeholder"></div>}>
        <img className="card__img" src={image} alt={cardId} />
      </Suspense>
    </Link>
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
