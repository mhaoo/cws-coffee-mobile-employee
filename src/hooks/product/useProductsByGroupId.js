import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

/**
 * Hook to fetch product list inside a group.
 * @param {number|string} groupId - ID of the product group.
 */
const useProductsByGroupId = (groupId) => {
  return useQuery({
    queryKey: ["productGroupsByGroup", groupId],
    queryFn: () =>
      authApi
        .getProductsByGroupId(groupId)
        .then((res) => res.data.content ?? res.data),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 10, // cache 10 minutes
    retry: 1,
  });
};

export default useProductsByGroupId;
