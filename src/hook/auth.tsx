import { directus } from "@/libs/directus";
import useSWR from "swr";
export function useAuth(options?: any) {
  const {
    data: profile,
    error,
    mutate,
  } = useSWR("/users/me?fields=*,role.*", {
    revalidateOnFocus: false,
    revalidateOnMount: false,
    shouldRetryOnError: false,
    ...options,
  });

  async function login() {
    await mutate();
  }
  async function logout() {
    await mutate(null as any, false);
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
    } catch (error) {}
    directus.logout();
  }
  const firstLoading = profile === undefined && error === undefined;
  const profileObj = profile?.data?.data || {};

  return {
    isLogin: firstLoading ? null : profile ? true : false,
    profile: { ...profileObj, roleName: profileObj.role?.name || "", fullname: profileObj.fullname || profileObj.first_name + " " + profileObj.last_name },
    error,
    login,
    logout,
    getProfile: mutate,
    firstLoading,
    data: profile?.data,
  };
}
