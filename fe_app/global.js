import { create } from "zustand";

const useGlobal = create((set) => ({

    // Authentication... 

    authenticated: true,
    user: {},

    login: (user) => set({ authenticated: true, user }),
    logout: () => set({ authenticated: false, user: {} }),

}))

export default useGlobal