import axios from "axios";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface Permission {
  PermissionAction: string;
}
interface PermissionsContextType {
  permissions: Permission[];
  permissionsLoaded: boolean;
  loadPermissions: (stafferId: string) => Promise<void>;
  hasPermission: (action: string) => Promise<boolean>;
  setStafferId: (id: string) => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined
);

interface PermissionsProviderProps {
  children: ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({
  children,
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [stafferId, setStafferId] = useState<string>("");
  const [permissionsLoaded, setPermissionsLoaded] = useState<boolean>(false);

  const loadPermissions = async (id: string) => {
    if (!permissionsLoaded) {
      try {
        const res = await axios.get(
          "/Permission/GET/GetPermissionsByUserRole",
          {
            params: { StafferId: id },
          }
        );
        if (res.status === 200) {
          setPermissions(res.data);
          setPermissionsLoaded(true);
        }
      } catch (error) {
        console.error("Errore nel caricamento dei permessi:", error);
      }
    }
  };

  const hasPermission = async (action: string) => {
    if (!permissionsLoaded) {
      await loadPermissions(stafferId);
    }
    return permissions.some(
      (permission) => permission.PermissionAction === action
    );
  };

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        permissionsLoaded,
        loadPermissions,
        hasPermission,
        setStafferId,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
};
