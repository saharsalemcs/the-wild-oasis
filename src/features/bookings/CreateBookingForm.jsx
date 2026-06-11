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
import Checkbox from "../../ui/Checkbox";
import Textarea from "../../ui/Textarea";
import { useNavigate } from "react-router-dom";

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

const PriceSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1.2rem 1.6rem;
  background-color: var(--color-grey-50);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-grey-200);
  font-size: 1.4rem;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  color: var(--color-grey-600);
`;

const PriceTotal = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: var(--color-grey-800);
  padding-top: 0.8rem;
  margin-top: 0.4rem;
  border-top: 1px solid var(--color-grey-200);
`;

function CreateBookingForm() {
  const { createBooking, isLoading: isCreating } = useCreateBooking();
  const { cabins, isLoading: isLoadingCabins } = useCabins();
  const { guests, isLoading: isLoadingGuests } = useGuests();
  const { settings: { breakfastPrice } = {} } = useSettings();
  const navigate = useNavigate();

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

  function onSubmit(data) {
    if (numNights <= 0) return;

    const bookingData = {
      ...data,
      cabinId: Number(data.cabinId),
      guestId: Number(data.guestId),
      numGuests: Number(data.numGuests),
      numNights,
      cabinPrice,
      extrasPrice,
      totalPrice,
      hasBreakfast: Boolean(data.hasBreakfast),
      isPaid: Boolean(data.isPaid),
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
          <Checkbox
            id="hasBreakfast"
            disabled={isLoading}
            checked={watch("hasBreakfast")}
            onChange={(e) => setValue("hasBreakfast", e.target.checked)}
          >
            Add breakfast (${breakfastPrice}/person/night)
          </Checkbox>
        </FormRow>

        <FormRow label="Payment status">
          <Checkbox
            id="isPaid"
            disabled={isLoading}
            checked={watch("isPaid")}
            onChange={(e) => setValue("isPaid", e.target.checked)}
          >
            Paid in full
          </Checkbox>
        </FormRow>

        <FormRow label="Status" error={errors?.status?.message}>
          <Select
            id="status"
            disabled={isLoading}
            value={watch("status") || "unconfirmed"}
            onChange={(e) =>
              setValue("status", e.target.value, { shouldValidate: true })
            }
            options={[
              { value: "unconfirmed", label: "Unconfirmed" },
              { value: "confirmed", label: "Confirmed" },
            ]}
          />
        </FormRow>

        <FormRow label="Observation">
          <Textarea
            id="observation"
            disabled={isLoading}
            placeholder="Any special requests or notes..."
            {...register("observation")}
          />
        </FormRow>

        {/* Price Summary */}
        {selectedCabin && numNights > 0 && (
          <FormRow label="Price summary">
            <PriceSummary>
              <PriceRow>
                <span>Cabin ({numNights} nights)</span>
                <span>${cabinPrice}</span>
              </PriceRow>

              {hasBreakfast && (
                <PriceRow>
                  <span>
                    Breakfast ({numGuests} guests × {numNights} nights)
                  </span>
                  <span>${extrasPrice}</span>
                </PriceRow>
              )}

              <PriceTotal>
                <span>Total</span>
                <span>${totalPrice}</span>
              </PriceTotal>
            </PriceSummary>
          </FormRow>
        )}

        {/* Actions */}
        <FormRow>
          <Button variation="secondary" type="reset" onClick={() => reset()}>
            Cancel
          </Button>
          <Button disabled={isLoading || numNights <= 0}>Create Booking</Button>
        </FormRow>
      </Form>
    </>
  );
}

export default CreateBookingForm;
