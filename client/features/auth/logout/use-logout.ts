import * as authApi from "@/features/auth/api";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();
  const logout = async () => {
    await authApi.logout();
    router.push("/auth/login");
    router.refresh();
  };

  return { logout };
};
