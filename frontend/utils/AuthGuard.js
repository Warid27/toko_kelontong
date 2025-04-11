import { useEffect } from "react";
import { useRouter } from "next/router";
import useUserStore from "@/stores/user-store";

// This component can be used in your _app.js or layout components
const AuthGuard = ({ children }) => {
  const router = useRouter();
  const redirectTo = useUserStore((state) => state.redirectTo);
  const clearRedirect = useUserStore((state) => state.clearRedirect);

  useEffect(() => {
    if (redirectTo) {
      router.push(redirectTo);
      clearRedirect(); // Clear the redirect after processing
    }
  }, [redirectTo, router, clearRedirect]);

  return children;
};

export default AuthGuard;
