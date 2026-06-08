import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGuest as createGuestApi } from "../../services/apiGuests";
import toast from "react-hot-toast";

export function useCreateGuest() {
  const queryClient = useQueryClient();

  const { mutate: createGuest, isLoading } = useMutation({
    mutationFn: createGuestApi,
    onSuccess: () => {
      toast.success("New guest created successfully");
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { createGuest, isLoading };
}
