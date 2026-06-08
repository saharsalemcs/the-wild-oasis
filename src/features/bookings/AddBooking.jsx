import { NavLink } from "react-router-dom";
import Button from "../../ui/Button";

function AddBooking() {
  return (
    <div>
      <NavLink to="/booking/new">
        <Button>Add New Booking</Button>
      </NavLink>
    </div>
  );
}

export default AddBooking;
