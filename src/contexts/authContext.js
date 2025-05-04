// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import authApi from "../api/authApi";
import {
  saveTokens,
  getAccessToken,
  removeTokens,
} from "../config/secureStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [employee, setEmployee] = useState(null); // { ... , branchId }
  const [tokenReady, setTokenReady] = useState(false); // chờ kiểm tra token
  const qc = useQueryClient();

  /* ===== Khôi phục khi mở app ===== */
  useEffect(() => {
    (async () => {
      const access = await getAccessToken();
      if (!access) return setTokenReady(true); // chưa login

      try {
        const { data } = await authApi.getProfile();
        setEmployee(data);
      } catch {
        await removeTokens(); // token cũ hỏng
      } finally {
        setTokenReady(true);
      }
    })();
  }, []);

  /* ===== LOGIN ===== */
  const signIn = async (email, password) => {
    // 1. login -> lấy token
    const { data } = await authApi.login(email, password);
    const { accessToken, refreshToken } = data;

    console.log("accessToken:", accessToken, "| refreshToken:", refreshToken);

    await saveTokens(accessToken, refreshToken);

    // 2. xoá cache (nếu muốn cụ thể hơn dùng qc.removeQueries(["rooms"]) ...)
    qc.clear();

    // 3. lấy hồ sơ
    const prof = await authApi.getProfile().then((r) => r.data);
    setEmployee(prof);
    setTokenReady(true); // đảm bảo RootStack render MainApp
  };

  /* ===== LOGOUT ===== */
  const signOut = async () => {
    await removeTokens();
    qc.clear();
    setEmployee(null);
  };

  return (
    <AuthContext.Provider
      value={{
        employee,
        branchId: employee?.branchId,
        signIn,
        signOut,
        tokenReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
