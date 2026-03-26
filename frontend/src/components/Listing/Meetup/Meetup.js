import { Button } from "../../Button/Button";
import { Input } from "../../Input/Input";

export const Meetup = () => {
  return (
    <div>
      <form>
        <label>
          Meetup Name
          <Input type="text" />
        </label>
        <label>
          Date
          <Input type="date" />
        </label>
        <label>
          Location
          <Input type="text" />
        </label>
        <Button variant="primary" className="meetup-form__submit" type="submit">
          Create Meetup
        </Button>
      </form>
    </div>
  );
};
