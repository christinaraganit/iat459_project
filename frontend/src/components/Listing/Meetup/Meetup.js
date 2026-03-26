import { Button } from "../../Button/Button";

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
        <Button variant="primary" className="meetup-form__submit" type="submit">
          Create Meetup
        </Button>
      </form>
    </div>
  );
};
