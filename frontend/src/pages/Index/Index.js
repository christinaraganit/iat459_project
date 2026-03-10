import { Fragment, useState } from "react";
import TCGdex from "@tcgdex/sdk";
import { useQuery } from "@tanstack/react-query";
import { getListings } from "../../api/listings";
import Card from "../../components/Card/Card";
import './Index.css';

const options = [
  {
    value: 'createdAt',
    label: 'Created At',
  },
  {
    value: 'price',
    label: 'Price',
  },
  {
    value: 'condition',
    label: 'Condition',
  }
];

export const Index = () => {
  const tcgdex = new TCGdex("en");

  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("desc");
  const [sort, setSort] = useState("createdAt");
  
  const listingsQuery = useQuery({
    queryKey: ['listings', search, order, sort],
    queryFn: async () => {
      const listings = await  getListings(search, sort, order);
      const cards = await Promise.all(listings?.map((listing) => tcgdex.card.get(listing.cardId)));
      return listings.map((listing, i) => ({
        ...listing,
        card: cards[i]
      }));
    }
  });
  
  const handleSortChange = (ev) => {
    setSort(ev.target.value);
  }
  
  console.log(listingsQuery.data);
  
  return (
    <Fragment>
      <div className="listing__nav">
        <h1>Listings near you</h1>
        <div>
          <select value={sort} onChange={handleSortChange}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button onClick={() => setOrder('asc')}>Asc</button>
          <button onClick={() => setOrder('desc')}>Desc</button>
        </div>
      </div>
      <div className="listing__list">
        {listingsQuery.data?.map((item) => (
          <Card
            key={item._id}
            seller={item.seller}
            price={item.price}
            condition={item.condition}
            image={item.card?.getImageURL('low')}
            cardId={item.card?.id}
            cardName={item.card?.name}
          />
        ))}
      </div>
    </Fragment>
  );
};
