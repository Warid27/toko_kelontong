// import { createContext, useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import jwtDecode from "jwt-decode";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const router = useRouter();

//   useEffect(() => {
//     const checkAuth = () => {
//       const token = localStorage.getItem("token");
//       if (!token || isTokenExpired(token)) {
//         logout();
//       } else {
//         setUser(jwtDecode(token)); // Set user data from token
//       }
//     };

//     // Run checkAuth only once on initial mount
//     checkAuth();

//     // Add an event listener for visibility change (e.g., alt + tab)
//     const handleVisibilityChange = () => {
//       if (document.visibilityState === "visible") {
//         checkAuth(); // Re-check auth when the tab becomes visible
//       }
//     };

//     document.addEventListener("visibilitychange", handleVisibilityChange);

//     // Cleanup event listener on unmount
//     return () => {
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//     };
//   }, []);

//   const isTokenExpired = (token) => {
//     try {
//       const { exp } = jwtDecode(token);
//       return exp * 1000 < Date.now();
//     } catch (error) {
//       return true;
//     }
//   };

//   const logout = () => {
//     localStorage.clear();
//     setUser(null);
//     router.push("/login");
//   };

//   return (
//     <AuthContext.Provider value={{ user, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
