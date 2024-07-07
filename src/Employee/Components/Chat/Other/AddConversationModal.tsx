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
  EmployeeId: number;
  EmployeeFullName: string;
  EmployeeEmail: string;
  EmployeeImageUrl: string;
}

interface ExistingMember {
  ConversationId: number;
  Staffer1Id: number;
  Staffer2Id: number;
  Staffer1FullName: string;
  Staffer2FullName: string;
  lastMessage: string;
  lastMessageDate?: Date;
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
    EmployeeId: -1,
    EmployeeFullName: "",
    EmployeeEmail: "",
    EmployeeImageUrl: "",
  });
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    axios
      .get("/Chat/GET/GetConversationByStafferId", {
        params: { StafferId: loggedStafferId },
      })
      .then((res) => {
        let ExistingMembers = res.data as ExistingMember[];
        axios.get("/Staffer/GET/GetAllStaffers").then((res) => {
          setMembers(
            res.data
              .filter(
                (staffer: Member) =>
                  !ExistingMembers.some(
                    (existingMember) =>
                      existingMember.Staffer1Id === loggedStafferId &&
                      existingMember.Staffer2Id === staffer.EmployeeId
                  ) &&
                  !ExistingMembers.some(
                    (existingMember) =>
                      existingMember.Staffer2Id === loggedStafferId &&
                      existingMember.Staffer1Id === staffer.EmployeeId
                  ) &&
                  staffer.EmployeeId !== loggedStafferId
              )
              .map((staffer: Member) => ({
                EmployeeId: staffer.EmployeeId,
                EmployeeFullName: staffer.EmployeeFullName,
                EmployeeEmail: staffer.EmployeeEmail,
                EmployeeImageUrl: staffer.EmployeeImageUrl,
              }))
          );
        });
      });
  }, [loggedStafferId]);

  function createConversation() {
    axios
      .post("/Chat/POST/CreateConversation", {
        Staffer1Id: loggedStafferId,
        Staffer2Id: member.EmployeeId,
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
      size="5xl"
      scrollBehavior="inside"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Aggiunta della conversazione con: {member.EmployeeFullName}
            </ModalHeader>
            <ModalBody>
              <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Dipendente
                    </dt>
                    <Autocomplete
                      defaultItems={members}
                      placeholder="Cerca per nome..."
                      className="max-w-xs"
                      variant="bordered"
                      radius="sm"
                      key={members.length}
                    >
                      {members.map((member) => (
                        <AutocompleteItem
                          startContent={
                            <Avatar
                              src={
                                member.EmployeeImageUrl &&
                                API_URL_IMG +
                                  "/profileIcons/" +
                                  member.EmployeeImageUrl
                              }
                              alt={member.EmployeeFullName}
                            />
                          }
                          key={member.EmployeeId}
                          onClick={() => {
                            setMember(member);
                          }}
                        >
                          {member.EmployeeFullName}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  </div>
                </dl>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="success"
                variant="light"
                onClick={createConversation}
                radius="sm"
              >
                Aggiorna
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
