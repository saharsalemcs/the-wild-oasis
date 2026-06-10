import { useMoveBack } from "../../hooks/useMoveBack";
import ButtonText from "../../ui/ButtonText";
import Row from "../../ui/Row";
import Heading from "../../ui/Heading";
import Select from "../../ui/Select";
import { useCreateBooking } from "./useCreateBooking";
import { HiOutlineSquare3Stack3D } from "react-icons/hi2";
import { useForm } from "react-hook-form";
import { useCabins } from "../cabins/useCabins";
import { useGuests } from "../guests/useGuests";
import { differenceInDays, parseISO } from "date-fns";
import { useSettings } from "../settings/useSettings";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import { formatCabinOptions, formatGuestOptions } from "../../utils/helpers";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import CreateGuestForm from "../guests/CreateGuestForm";
import styled from "styled-components";
import Input from "../../ui/Input";

const StyledFormRow = styled.div`
  display: grid;
  grid-template-columns: 24rem 1fr;
  align-items: center;
  gap: 2.4rem;
  padding: 1.2rem 0;
  border-bottom: 1px solid var(--color-grey-100);
`;

const GuestSelectWrapper = styled.div`
  display: flex;
  gap: 1.8rem;
  align-items: center;
`;

function CreateBookingForm() {
  const { createBooking, isLoading: isCreating } = useCreateBooking();
  const { cabins, isLoading: isLoadingCabins } = useCabins();
  const { guests, isLoading: isLoadingGuests } = useGuests();
  const { settings: { breakfastPrice } = {} } = useSettings();

  const {
    register,
    handleSubmit,
    getValues,
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

  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const cabinId = watch("cabinId");
  const hasBreakfast = watch("hasBreakfast");
  const numGuests = watch("numGuests");

  const selectedCabin = cabins?.find((c) => c.id === Number(cabinId));

  // اليوم راجع ك سترينج ف عشان كدا هحوله ل اوبجيكت الاول
  const numNights =
    startDate && endDate
      ? differenceInDays(parseISO(endDate), parseISO(startDate))
      : 0;

  const cabinPrice =
    numNights > 0 && selectedCabin
      ? numNights * (selectedCabin.regularPrice - (selectedCabin.discount || 0))
      : 0;

  // const breakfastPrice = settings.breakfastPrice;
  const extrasPrice =
    hasBreakfast && numNights > 0 && numGuests
      ? breakfastPrice * numNights * Number(numGuests)
      : 0;

  const totalPrice = cabinPrice + extrasPrice;
  const isLoading = isCreating || isLoadingCabins || isLoadingGuests;

  const moveBack = useMoveBack();

  function onSubmit(data) {}

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* CABIN */}
        <FormRow label="Cabin" error={errors?.cabinId?.message}>
          <Select
            options={formatCabinOptions(cabins)}
            id={cabinId}
            disabled={isLoading}
            value={watch("cabinId") || ""}
            onChange={(e) =>
              setValue("cabinId", e.target.value, { shouldValidate: true })
            }
          />
        </FormRow>

        {/* GUEST */}
        <StyledFormRow>
          <label style={{ fontWeight: 500 }}>Guest</label>
          <GuestSelectWrapper>
            <Select
              options={formatGuestOptions(guests)}
              value={watch("guestId") || ""}
              onChange={(e) =>
                setValue("guestId", e.target.value, { shouldValidate: true })
              }
            />
            {/* Modal to add guest */}
            <Modal>
              <Modal.Open opens="guest-form">
                <Button
                  type="button"
                  size="medium"
                  style={{ padding: "1rem 1.3rem" }}
                >
                  Create New Guest
                </Button>
              </Modal.Open>
              <Modal.Window name="guest-form">
                <CreateGuestForm
                  onSuccess={(newGuest) => setValue("guestId", newGuest.id)}
                />
              </Modal.Window>
            </Modal>
          </GuestSelectWrapper>
        </StyledFormRow>

        {/* Start Date */}
        <FormRow label="Start Date" error={errors?.startDate?.message}>
          <Input
            type="date"
            id="startDate"
            disabled={isLoading}
            {...register("startDate", { required: "Start date is required" })}
          />
        </FormRow>

        {/* End Date */}
        <FormRow label="End Date" error={errors?.endDate?.message}>
          <Input
            type="date"
            id="endDate"
            disabled={isLoading}
            {...register("endDate", {
              required: "End date is required",
              validate: (val) =>
                !startDate ||
                differenceInDays(parseISO(val), parseISO(startDate)) > 0 ||
                "End date must be after start date",
            })}
          />
        </FormRow>

        {/* ─── Num Guests ─── */}
        <FormRow label="Number of Guests" error={errors?.numGuests?.message}>
          <Input
            type="number"
            id="numGuests"
            disabled={isLoading}
            min={1}
            max={selectedCabin?.maxCapacity || 10}
            {...register("numGuests", {
              required: "Number of guests is required",
              min: { value: 1, message: "Minimum 1 guest" },
              max: {
                value: selectedCabin?.maxCapacity || 999,
                message: `Max capacity is ${selectedCabin?.maxCapacity}`,
              },
            })}
          />
        </FormRow>

        {/* ─── Has Breakfast ─── */}
        <FormRow label="Breakfast included?">
          <input
            type="checkbox"
            id="hasBreakfast"
            disabled={isLoading}
            {...register("hasBreakfast")}
          />
        </FormRow>

        {/* ─── Is Paid ─── */}
        <FormRow label="Paid?">
          <input
            type="checkbox"
            id="isPaid"
            disabled={isLoading}
            {...register("isPaid")}
          />
        </FormRow>
      </Form>
    </>
  );
}

export default CreateBookingForm;
