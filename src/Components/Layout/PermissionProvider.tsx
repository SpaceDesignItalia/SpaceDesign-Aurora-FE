import { createContext, useContext, useState } from "react";

// Context per i permessi
const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);

  const fetchPermissions = async () => {
    const response = await fetch("/api/permissions");
    if (!response.ok) {
      throw new Error("Failed to fetch permissions");
    }
    const permissions = await response.json();
    return permissions;
  };

  const loadPermissions = async () => {
    try {
      const userPermissions = await fetchPermissions();
      setPermissions(userPermissions);
    } catch (error) {
      console.error("Errore nel caricamento dei permessi:", error);
    }
  };

  const hasPermission = (action) => {
    return permissions.includes(action);
  };

  return (
    <PermissionsContext.Provider value={{ loadPermissions, hasPermission }}>
      {children}
    </PermissionsContext.Provider>
  );
};

// Hook personalizzato per usare i permessi
export const usePermissions = () => {
  return useContext(PermissionsContext);
};
