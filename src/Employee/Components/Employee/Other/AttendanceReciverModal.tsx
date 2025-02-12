import React, { useMemo, useState } from "react";
import {
  Button,
  Input,
  Spacer,
  AvatarGroup,
  Avatar,
  Form,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";

export default function AttendanceReciverModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [email, setEmail] = React.useState<string>("");
  const [userEmails, setUserEmails] = useState<string[]>([]);

  // Memoize the user list to avoid re-rendering when changing the selected keys
  const userList = useMemo(
    () => (
      <div className="mt-2 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
        {userEmails.length > 0 ? (
          userEmails.map((userEmail, index) => (
            <>
              <div key={index} className="flex justify-between items-center">
                <span>{userEmail}</span>
                <Button
                  variant="light"
                  color="danger"
                  size="sm"
                  onPress={() => handleRemoveUser(userEmail)}
                >
                  <Icon icon="solar:trash-bin-trash-linear" fontSize={20} />
                </Button>
              </div>
              <Divider />
            </>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <Icon
              icon="fluent:people-16-regular"
              fontSize={50}
              className="text-gray-500"
            />
            <p className="text-gray-500">Nessuna email aggiunta ancora.</p>
          </div>
        )}
      </div>
    ),
    [userEmails]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("handleSubmit");
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleAddUser = () => {
    if (email) {
      setUserEmails((prevEmails) => [...prevEmails, email]);
      setEmail("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddUser();
    }
  };

  const handleRemoveUser = (emailToRemove: string) => {
    setUserEmails((prevEmails) =>
      prevEmails.filter((email) => email !== emailToRemove)
    );
  };

  return (
    <>
      <Button radius="full" variant="bordered" onPress={onOpen}>
        <Icon icon="solar:settings-linear" fontSize={22} />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent className="w-full max-w-[400px]">
          {(onClose) => (
            <>
              <ModalHeader className="justify-center px-6 pb-0 pt-6">
                <div className="flex flex-col items-center">
                  <AvatarGroup isBordered>
                    <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                  </AvatarGroup>
                  <Spacer y={2} />
                  <h4 className="text-large">Aggiungi membro</h4>
                  <p className="text-center text-small text-default-500">
                    Aggiungi un membro che può ricevere il report delle presenze
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="flex items-end gap-2">
                  <Form
                    className="w-full flex-row flex-nowrap items-end"
                    validationBehavior="native"
                    onSubmit={handleSubmit}
                  >
                    <Input
                      isRequired
                      variant="bordered"
                      radius="full"
                      name="email"
                      placeholder="Inserisci l'email"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      onKeyDown={handleKeyDown}
                    />
                    <Button
                      radius="full"
                      color="primary"
                      size="md"
                      type="submit"
                    >
                      <Icon icon="mynaui:plus-solid" fontSize={22} />
                    </Button>
                  </Form>
                </div>
                <Spacer y={4} />
                {userList}
              </ModalBody>
              <ModalFooter className="justify-end gap-2">
                <Button color="danger" variant="light" onPress={onClose}>
                  Chiudi
                </Button>
                <Button color="primary" onPress={onClose}>
                  Salva
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
