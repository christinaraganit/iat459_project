export const Meetup = () => {
  return (
    <div>
      <form>
        <label>
          Meetup Name
          <input type="text"></input>
        </label>
        <label>
          Date
          <input type="date"></input>
        </label>
        <label>
          Location
          <input type="text"></input>
        </label>
        <button type="submit">Create Meetup</button>
      </form>
    </div>
  );
};
