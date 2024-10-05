import {
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useState, useEffect } from "react";
import { API_URL_IMG } from "../../../../API/API";
import axios from "axios";

interface Member {
  StafferId: number;
  StafferFullName: string;
  StafferImageUrl: string;
}

export default function AddConversationModal({
  isOpen,
  isClosed,
  loggedStafferId,
  handleOpenChat,
}: {
  isOpen: boolean;
  isClosed: () => void;
  loggedStafferId: number;
  handleOpenChat: (conversationId: number) => void;
}) {
  const [member, setMember] = useState<Member>({
    StafferId: 0,
    StafferFullName: "",
    StafferImageUrl: "",
  });
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    axios
      .get("/Chat/GET/FindStaffersWithoutMessagesFromLoggedStaffer", {
        params: { StafferId: loggedStafferId },
      })
      .then((res) => {
        console.log(res.data);
        setMembers(res.data);
      });
  }, [loggedStafferId]);

  function createConversation() {
    axios
      .post("/Chat/POST/CreateConversation", {
        Staffer1Id: loggedStafferId,
        Staffer2Id: member.StafferId,
      })
      .then((res) => {
        window.location.reload();
        handleOpenChat(res.data);
        isClosed();
      });
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={isClosed}
      size="xl"
      scrollBehavior="inside"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Crea conversazione con: {member.StafferFullName}
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-6">
                  <Autocomplete
                    defaultItems={members}
                    placeholder="Cerca per nome..."
                    variant="bordered"
                    radius="sm"
                    key={members.length}
                  >
                    {members.map((member) => (
                      <AutocompleteItem
                        startContent={
                          <Avatar
                            src={
                              member.StafferImageUrl &&
                              API_URL_IMG +
                                "/profileIcons/" +
                                member.StafferImageUrl
                            }
                            alt={member.StafferFullName}
                          />
                        }
                        key={member.StafferId}
                        onClick={() => {
                          setMember(member);
                        }}
                      >
                        {member.StafferFullName}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                onClick={createConversation}
                radius="full"
              >
                Aggiungi
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
