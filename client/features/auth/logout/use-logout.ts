import { useRouter } from "next/navigation";
import * as api from "./logout-api";

export const useLogout = () => {
  const router = useRouter();
  const logout = async () => {
    await api.logout();
    router.push("/auth/login");
    router.refresh();
  };

  return { logout };
};
