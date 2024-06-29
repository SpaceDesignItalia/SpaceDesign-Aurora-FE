import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  Tooltip,
} from "@nextui-org/react";
import { API_URL_IMG } from "../../../../API/API";
import { useState } from "react";

interface Link {
  ProjectId: number;
  ProjectLinkId: number;
  ProjectLinkTitle: string;
  ProjectLinkUrl: string;
  ProjectLinkTypeId: number;
  ProjectLinkTypeImage: string;
}

export default function DeleteLinkModal({
  isOpen,
  isClosed,
  LinkData,
  DeleteLink,
}) {
  const [selected, setSelected] = useState<string>("");
  console.log(LinkData);
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
        {(isClosed) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold">Rimuovi link</h3>
            </ModalHeader>
            <ModalBody>
              <RadioGroup
                label="Seleziona il link da rimuovere"
                value={selected}
                onValueChange={setSelected}
              >
                {LinkData.map((link: Link, index: number) => {
                  return (
                    <Radio value={link.ProjectLinkId.toString()} key={index}>
                      <span className="flex flex-row justify-center items-center gap-3">
                        <img
                          src={
                            API_URL_IMG +
                            "/linkIcons/" +
                            link.ProjectLinkTypeImage
                          }
                          className="h-5 w-5"
                        />
                        <h1>{link.ProjectLinkTitle}</h1>
                      </span>
                    </Radio>
                  );
                })}
              </RadioGroup>
            </ModalBody>
            <ModalFooter className="flex sm:flex-row flex-col">
              <Button
                color="success"
                variant="light"
                onClick={() => {
                  DeleteLink(selected);
                  isClosed();
                }}
                isDisabled={selected === ""}
                radius="sm"
                className="mr-2"
              >
                Conferma eliminazione
              </Button>
              <Button variant="light" onClick={isClosed} radius="sm">
                Annulla
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
