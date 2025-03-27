"use client";
import { createContext, useContext, useState } from "react";
type User = {
  name: string;
  role: string;
  email: string;
  batch: [];
  _id: string;
};
type Batch = {
  name: string;
  inviteCode: string;
  users: [];
  requests: [];
  notices: [];
  lectures: [];
  notes: [];
  isArchived: boolean;
};
export const AppContext = createContext({
  mode: "light",
  toggleMode: function () {},
  user: {
    name: "",
    role: "",
    email: "",
    batch: [],
    _id: "",
  },
  setUser: function (user: User) {},
  loading: false,
  toggleLoading: function () {},
  batch: {
    name: "",
    inviteCode: "",
    users: [],
    requests: [],
    notices: [],
    lectures: [],
    notes: [],
    isArchived: false,
  },
  setBatch: function (batch: Batch) {},
});
export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState("light");
  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };
  const [currentUser, setCurrentUser] = useState({
    name: "",
    role: "",
    email: "",
    batch: [],
    _id: "",
  });
  const setUser = (user: User) => {
    setCurrentUser(user);
  };
  const [currentBatch, setCurrentBatch] = useState({
    name: "",
    inviteCode: "",
    users: [],
    requests: [],
    notices: [],
    lectures: [],
    notes: [],
    isArchived: false,
  });
  const setBatch = (batch: Batch) => {
    setCurrentBatch(batch);
  };
  const [loading, setLoading] = useState(false);
  const toggleLoading = () => {
    setLoading((prevLoading) => !prevLoading);
  };
  return (
    <AppContext.Provider
      value={{
        mode,
        toggleMode,
        user: currentUser,
        setUser,
        loading,
        toggleLoading,
        batch: currentBatch,
        setBatch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
export function useAppContext() {
  return useContext(AppContext);
}
