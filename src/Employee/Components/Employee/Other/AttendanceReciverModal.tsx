import React, { useEffect, useMemo, useState } from "react";
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
import axios from "axios";

export default function AttendanceReciverModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [email, setEmail] = React.useState<string>("");
  const [userEmails, setUserEmails] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserEmails();
  }, [email]);

  async function fetchUserEmails() {
    axios.get("/Staffer/GET/GetAttendanceEmails").then((res) => {
      setUserEmails(res.data);
    });
  }

  const userList = useMemo(
    () => (
      <div className="mt-2 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
        {userEmails.length > 0 ? (
          userEmails.map((userEmail, index) => (
            <div key={index}>
              <div className="flex justify-between items-center">
                <span>{userEmail.AttendanceReportEmail}</span>
                <Button
                  variant="light"
                  color="danger"
                  size="sm"
                  onPress={() =>
                    handleRemoveUser(userEmail.AttendanceReportEmail)
                  }
                >
                  <Icon icon="solar:trash-bin-trash-linear" fontSize={20} />
                </Button>
              </div>
              <Divider />
            </div>
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
    handleAddUser(); // Permettiamo sempre l'invio, anche con errori
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setError(null); // Reset dell'errore al cambiamento dell'email
  };

  const handleAddUser = () => {
    if (email) {
      axios
        .post("/Staffer/POST/AddAttendanceEmail", {
          AttendanceEmail: email,
        })
        .then(() => {
          setEmail("");
          setError(null);
          fetchUserEmails();
        })
        .catch((err) => {
          if (err.response && err.response.status === 409) {
            setError("Questa email è già stata aggiunta.");
          } else {
            setError("Errore nell'aggiunta dell'email.");
          }
        });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddUser();
    }
  };

  const handleRemoveUser = async (emailToRemove: string) => {
    const res = await axios.delete("/Staffer/DELETE/DeleteAttendanceEmail", {
      params: { AttendanceEmail: emailToRemove },
    });
    if (res.status === 200) {
      fetchUserEmails();
    }
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
                    className="w-full flex-row flex-nowrap justify-center items-start"
                    validationBehavior="native"
                    onSubmit={handleSubmit}
                  >
                    <Input
                      variant="bordered"
                      radius="full"
                      name="email"
                      placeholder="Inserisci l'email"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      onKeyDown={handleKeyDown}
                      errorMessage={error} // Mostra il messaggio di errore
                      isInvalid={!!error}
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
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
