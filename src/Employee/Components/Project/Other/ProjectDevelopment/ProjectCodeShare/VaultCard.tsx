import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

interface Vault {
  id: number;
  name: string;
  creationDate: Date;
  items?: number; // Numero di elementi salvati nel vault
}

export default function VaultCard({ vault }: { vault: Vault }) {
  const itemCount = vault.items || 0;

  return (
    <div className="bg-white rounded-lg border-2 p-4 flex justify-between items-center">
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800">{vault.name}</h3>
        <p className="text-sm text-gray-500">
          {itemCount} {itemCount === 1 ? "elemento" : "elementi"} salvati
        </p>
      </div>

      <div className="relative">
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" radius="full" isIconOnly>
              <Icon icon="solar:menu-dots-bold" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions">
            <DropdownItem key="new">Apri vault</DropdownItem>
            <DropdownItem key="delete" className="text-danger" color="danger">
              Elimina vault
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
}
