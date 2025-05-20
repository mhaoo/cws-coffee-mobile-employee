import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

/**
 * Hook to fetch all categories.
 */
const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => authApi.getCategories().then((res) => res.data.content),
    staleTime: 1000 * 60 * 10, // cache for 10 minutes
    retry: 1,
  });
};

export default useCategories;
