import { useCreateBooking } from "./useCreateBooking";
import { useForm } from "react-hook-form";
import { useCabins } from "../cabins/useCabins";
import { useGuests } from "../guests/useGuests";
import { differenceInDays, parseISO } from "date-fns";
import { useSettings } from "../settings/useSettings";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Button from "../../ui/Button";

import { useNavigate } from "react-router-dom";
import BookingFormFields from "./BookingFormFields";

function CreateBookingForm() {
  const { createBooking, isLoading: isCreating } = useCreateBooking();
  const { cabins, isLoading: isLoadingCabins } = useCabins();
  const { guests, isLoading: isLoadingGuests } = useGuests();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      status: "unconfirmed",
      isPaid: false,
      hasBreakfast: false,
    },
  });

  const isLoading = isCreating || isLoadingCabins || isLoadingGuests;
  const { settings: { breakfastPrice } = {} } = useSettings();

  function onSubmit(data) {
    const startDate = new Date(data.startDate).toISOString();
    const endDate = new Date(data.endDate).toISOString();
    const numNights = differenceInDays(
      parseISO(data.endDate),
      parseISO(data.startDate),
    );
    const selectedCabin = cabins?.find((c) => c.id === Number(data.cabinId));
    const cabinPrice =
      numNights * (selectedCabin.regularPrice - (selectedCabin.discount || 0));
    const extrasPrice = data.hasBreakfast
      ? breakfastPrice * Number(data.numGuests) * numNights
      : 0;

    const bookingData = {
      ...data,
      cabinId: Number(data.cabinId),
      guestId: Number(data.guestId),
      numGuests: Number(data.numGuests),
      numNights,
      cabinPrice,
      extrasPrice,
      totalPrice: cabinPrice + extrasPrice,
      hasBreakfast: Boolean(data.hasBreakfast),
      isPaid: Boolean(data.isPaid),
      startDate,
      endDate,
      status: data.status || "unconfirmed",
      created_at: new Date().toISOString(),
    };

    createBooking(bookingData, {
      onSuccess: () => {
        reset();
        navigate("/bookings");
      },
    });
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} type="regular">
      <BookingFormFields
        watch={watch}
        setValue={setValue}
        register={register}
        errors={errors}
        cabins={cabins}
        guests={guests}
        isLoading={isLoading}
      />
      <FormRow>
        <Button variation="secondary" type="reset" onClick={() => reset()}>
          Cancel
        </Button>
        <Button disabled={isLoading}>Create Booking</Button>
      </FormRow>
    </Form>
  );
}

export default CreateBookingForm;
