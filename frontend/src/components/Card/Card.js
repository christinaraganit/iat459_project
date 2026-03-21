import "./Card.css";
import { useAuthContext } from "../../context/AuthContext";

function Card({ seller, price, condition, image, cardId, cardName }) {
  const { user } = useAuthContext();
  return (
    <div className="card">
      <img className="card__img" src={image} alt={cardId} />
      <div className="card__info">
        <h2>Name: {cardName}</h2>
        <p>Condition: {condition}</p>
        <p>Price: ${price.toFixed(2)}</p>
        {seller !== null ? (
          <p>Seller: {seller.displayName || seller.username}</p>
        ) : (
          <p>Unavailable Account</p>
        )}
        {user && <button>Send Interest</button>}
      </div>
    </div>
  );
}

export default Card;
