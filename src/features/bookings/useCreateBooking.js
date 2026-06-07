import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBooking as createBookingApi } from "../../services/apiBookings";
import toast from "react-hot-toast";

export function useCreateBooking() {
  const queryClient = useQueryClient();

  const { mutate: createBooking, isLoading } = useMutation({
    mutationFn: createBookingApi,
    onSuccess: () => {
      toast.success("Booking created successfully");
      queryClient.invalidateQueries({
        queryKey: ["cabins"],
      });
    },

    onError: (err) => toast.error(err.message),
  });

  return { createBooking, isLoading };
}
