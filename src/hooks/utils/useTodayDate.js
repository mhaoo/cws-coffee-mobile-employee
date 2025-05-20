import { formatFullDate } from "../../utils/getTodayDate";
import useServerTime from "./useServerTime";

/**
 * Hook to get today's date string using server time.
 */
export function useToday() {
  const { data: serverDate } = useServerTime();
  // While loading or missing, fallback to client date
  const dateToFormat = serverDate || new Date();
  return formatFullDate(dateToFormat);
}
