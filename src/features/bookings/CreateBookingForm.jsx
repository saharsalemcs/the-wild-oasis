import { useMoveBack } from "../../hooks/useMoveBack";
import ButtonText from "../../ui/ButtonText";
import Row from "../../ui/Row";
import Heading from "../../ui/Heading";
import { useCreateBooking } from "./useCreateBooking";
import { HiOutlineSquare3Stack3D } from "react-icons/hi2";

function CreateBookingForm() {
  const { createBooking, isLoading: isCreating } = useCreateBooking();

  const moveBack = useMoveBack();

  return (
    <>
      <div>
        <ButtonText onClick={moveBack}>&larr; Back</ButtonText>

        <Row>
          <Heading as="h1">
            <span>
              <HiOutlineSquare3Stack3D />
            </span>
          </Heading>
        </Row>
      </div>
    </>
  );
}

export default CreateBookingForm;
