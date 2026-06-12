import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBooking as updateBookingApi } from "../../services/apiBookings";
import toast from "react-hot-toast";

export function useEditBooking() {
  const queryClient = useQueryClient();

  const { mutate: editBooking, isLoading: isEditing } = useMutation({
    mutationFn: ({ newBookingData, id }) =>
      updateBookingApi(newBookingData, id),

    onSuccess: () => {
      toast.success("Booking updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },

    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { editBooking, isEditing };
}
