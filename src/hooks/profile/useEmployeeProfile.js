// src/hooks/auth/useEmployeeProfile.js
import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

/**
 * Lấy hồ sơ nhân viên (có branchId, v.v.)
 * Header Authorization đã được interceptor gắn token.
 */
export default function useEmployeeProfile(enabled = true) {
  return useQuery({
    queryKey: ["employeeProfile"],
    queryFn: () => authApi.getProfile().then((res) => res.data),
    enabled, // =false nếu chưa có token
    staleTime: 1000 * 60 * 10, // cache 10'
  });
}
