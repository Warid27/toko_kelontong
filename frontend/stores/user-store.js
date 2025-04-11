import { create } from "zustand";
import { tokenDecoded, clearUserCache } from "@/utils/tokenDecoded";
import { checkAuth } from "@/utils/checkAuth";

// Create a store without router dependencies
const useUserStore = create((set, get) => ({
  // State
  selectedLink: "profile",
  userData: null,
  isAuthenticated: false,
  isLoading: true,
  redirectTo: null,
  isSidebarOpen: false,

  // Helper functions
  getValidatedLocalStorageValue: (key) => {
    if (typeof window !== "undefined") {
      const value = localStorage.getItem(key);
      return value && value !== "undefined" && value !== "null" ? value : null;
    }
    return null;
  },

  // Actions
  setSelectedLink: (newLink) => set({ selectedLink: newLink }),
  fetchUserData: async () => {
    set({ isLoading: true });

    try {
      // Check authentication
      const authStatus = await new Promise((resolve) => {
        checkAuth(
          (status) => resolve(status),
          () => get().logout(true)
        );
      });

      set({ isAuthenticated: authStatus });

      if (!authStatus) {
        set({ isLoading: false });
        return null;
      }

      // Fetch user data from token
      const response = await tokenDecoded();

      if (response && typeof response === "object") {
        // Get company and store IDs from localStorage if needed
        const companyId =
          response.id_company !== null
            ? response.id_company
            : get().getValidatedLocalStorageValue("id_company");

        const storeId =
          response.id_store !== null
            ? response.id_store
            : get().getValidatedLocalStorageValue("id_store");

        // Set merged user data
        const mergedUserData = {
          ...response,
          id_company: companyId,
          id_store: storeId,
        };

        set({
          userData: mergedUserData,
          isAuthenticated: true,
          isLoading: false,
        });

        return mergedUserData;
      } else {
        get().logout(true);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      get().logout(true);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: (setUnauthorized = true) => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      if (setUnauthorized) {
        localStorage.setItem("unauthorized", "true");
      }
    }
    clearUserCache();
    set({
      selectedLink: "profile",
      isAuthenticated: false,
      userData: null,
      redirectTo: "/login", // Set the redirect path
    });
  },

  // Clear the redirect after it's been processed
  clearRedirect: () => set({ redirectTo: null }),

  updateLocalStorage: (key, value) => {
    if (typeof window === "undefined") return;

    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }

    // Update userData if the key is id_company or id_store
    if ((key === "id_company" || key === "id_store") && get().userData) {
      set((state) => ({
        userData: {
          ...state.userData,
          [key]: value,
        },
      }));
    }

    // Dispatch custom event
    const event = new CustomEvent("localStorageChange", {
      detail: { key, value },
    });
    window.dispatchEvent(event);
  },

  updateCompanyAndStore: () => {
    const { userData, getValidatedLocalStorageValue } = get();
    if (!userData) return;

    const companyId =
      userData.id_company !== null
        ? userData.id_company
        : getValidatedLocalStorageValue("id_company");

    const storeId =
      userData.id_store !== null
        ? userData.id_store
        : getValidatedLocalStorageValue("id_store");

    // Only update if values are different
    if (userData.id_company !== companyId || userData.id_store !== storeId) {
      set((state) => ({
        userData: {
          ...state.userData,
          id_company: companyId,
          id_store: storeId,
        },
      }));
    }
  },

  // Setup authentication checking interval
  setupAuthCheck: () => {
    if (typeof window === "undefined") return () => {};

    const interval = setInterval(() => {
      checkAuth(
        (authStatus) => {
          set({ isAuthenticated: authStatus });
          if (!authStatus) {
            get().logout(true);
          }
        },
        () => get().logout(true)
      );
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  },

  // Update user data
  updateUserProfile: (updatedFields) => {
    set((state) => ({
      userData: {
        ...state.userData,
        ...updatedFields,
      },
    }));
  },

  // Update isSidebarOpen
  updateSidebarOpen: (value) => set({ isSidebarOpen: value }),
}));

export default useUserStore;
