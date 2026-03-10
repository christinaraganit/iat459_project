import "./Card.css";

function Card({seller, price, condition, image, cardId, cardName}) {
  return (
    <div className="card">
      <img className="card__img" src={image} alt={cardId}/>
      <div className="card__info">
        <h2>Name: {cardName}</h2>
        <p>Condition: {condition}</p>
        <p>Price: ${price.toFixed(2)}</p>
        <p>Seller: {seller}</p>
      </div>
    </div>
  )
}

export default Card;