import { useForm } from "react-hook-form";
import Form from "../../ui/Form";
import { useCabins } from "../cabins/useCabins";
import { useGuests } from "../guests/useGuests";
import { useEditBooking } from "./useEditBooking";
import BookingFormFields from "./BookingFormFields";
import FormRow from "../../ui/FormRow";
import Button from "../../ui/Button";
import { differenceInDays, parseISO } from "date-fns";
import { useSettings } from "../settings/useSettings";

function EditBookingForm({ bookingToEdit = {}, onCloseModal }) {
  const { id: editId, ...editValues } = bookingToEdit;
  const { editBooking, isEditing } = useEditBooking();
  const { cabins, isLoading: isLoadingCabins } = useCabins();
  const { guests, isLoading: isLoadingGuests } = useGuests();
  const { settings: { breakfastPrice } = {} } = useSettings();

  const defaultValues = {
    ...editValues,
    startDate: editValues.startDate?.slice(0, 10),
    endDate: editValues.endDate?.slice(0, 10),
  };

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const isLoading = isEditing || isLoadingCabins || isLoadingGuests;

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
      ? breakfastPrice * Number(selectedCabin.numGuests) * numNights
      : 0;

    const newBookingData = {
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
    };

    editBooking(
      { newBookingData, id: editId },
      {
        onSuccess: () => {
          reset();
          onCloseModal?.();
        },
      },
    );
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} type="modal">
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
        <Button
          variation="secondary"
          type="reset"
          disabled={isLoading}
          onClick={() => onCloseModal?.()}
        >
          Cancel
        </Button>
        <Button disabled={isLoading}>Save Changes</Button>
      </FormRow>
    </Form>
  );
}

export default EditBookingForm;
