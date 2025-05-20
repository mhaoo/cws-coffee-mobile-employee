import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api/apiClient";

/**
 * Hook to fetch current server time based on HTTP response header 'Date'.
 */
export default function useServerTime() {
  return useQuery({
    queryKey: ["serverTime"],
    queryFn: async () => {
      // Call any lightweight endpoint to get response header
      const res = await apiClient.get("/api/employee");
      const dateHeader = res.headers.date;
      // Fallback to client date if header missing
      return dateHeader ? new Date(dateHeader) : new Date();
    },
    staleTime: 1000 * 60, // 1 minute
    retry: 1,
  });
} 