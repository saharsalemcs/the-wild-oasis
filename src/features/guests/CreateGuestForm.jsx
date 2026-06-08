import { useForm } from "react-hook-form";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import useCreateGuest from "./useCreateGuest";
import Button from "../../ui/Button";

function CreateGuestForm({ onSuccess, onCancel }) {
  const { createGuest, isLoading: isCreating } = useCreateGuest();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  function onSubmit(data) {
    createGuest(data, {
      onSuccess: (newGuest) => {
        reset();
        onSuccess?.(newGuest); // بترجع الـ guest الجديد للـ BookingForm
      },
    });
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormRow label="Full Name" error={errors?.fullName?.message}>
        <Input
          type="text"
          id="fullName"
          disabled={isCreating}
          {...register("fullName", { required: "Full name is required" })}
        />
      </FormRow>

      <FormRow label="Email" error={errors?.email?.message}>
        <Input
          type="email"
          id="email"
          disabled={isCreating}
          {...register("email", {
            required: "email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Please provide a valid email address",
            },
          })}
        />
      </FormRow>
      <FormRow label="National ID" error={errors?.nationalID?.message}>
        <Input
          type="text"
          id="nationalID"
          disabled={isCreating}
          {...register("nationalID", { required: "National ID is required" })}
        />
      </FormRow>

      <FormRow label="Nationality" error={errors?.nationality?.message}>
        <Input
          type="text"
          id="nationality"
          disabled={isCreating}
          {...register("nationality", { required: "Nationality is required" })}
        />
      </FormRow>

      <FormRow
        label="Country Flag (emoji)"
        error={errors?.countryFlag?.message}
      >
        <Input
          type="text"
          id="countryFlag"
          placeholder="🇪🇬"
          disabled={isCreating}
          {...register("countryFlag")}
        />
      </FormRow>

      <FormRow>
        {/* type is an HTML attribute! */}
        <Button
          variation="secondary"
          type="button"
          disabled={isCreating}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button disabled={isCreating}>Create Guest</Button>
      </FormRow>
    </Form>
  );
}

export default CreateGuestForm;
