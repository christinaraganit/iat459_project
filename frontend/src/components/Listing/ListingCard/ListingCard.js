import "./ListingCard.css";
import { Fragment, Suspense } from "react";
import { useAuthContext } from "../../../context/AuthContext";

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
    <a href={`/listings/${id}`} className="card">
      <Suspense fallback={<div className="card__img_placeholder"></div>}>
        <img className="card__img" src={image} alt={cardId} />
      </Suspense>
    </a>
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
          <button>Report listing</button>
        </Fragment>
      )}
      {/* {user && seller !== null && <button>Send Interest</button>} */}
    </div>
  </Fragment>
);

export default ListingCard;
