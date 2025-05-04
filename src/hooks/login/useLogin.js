import { useMutation } from "@tanstack/react-query";
import authApi from "../../api/authApi";

const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }) => authApi.login(email, password),
  });
};

export default useLogin;
