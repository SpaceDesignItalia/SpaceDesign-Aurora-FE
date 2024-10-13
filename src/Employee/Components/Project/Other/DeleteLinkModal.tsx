import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
} from "@nextui-org/react";
import { API_URL_IMG } from "../../../../API/API";
import { useState } from "react";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

interface Link {
  ProjectId: number;
  ProjectLinkId: number;
  ProjectLinkTitle: string;
  ProjectLinkUrl: string;
  ProjectLinkTypeId: number;
  ProjectLinkTypeImage: string;
}

interface DeleteLinkModalProps {
  isOpen: boolean;
  isClosed: () => void;
  LinkData: Link[];
  DeleteLink: (selected: string) => void;
}

export default function DeleteLinkModal({
  isOpen,
  isClosed,
  LinkData,
  DeleteLink,
}: DeleteLinkModalProps) {
  const [selected, setSelected] = useState<string>("");
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
              <h3 className="text-xl font-semibold">Rimuovi collegamento:</h3>
            </ModalHeader>
            <ModalBody>
              <RadioGroup
                label="Seleziona il link da rimuovere:"
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
              <Button variant="light" onClick={isClosed} radius="sm">
                Annulla
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  DeleteLink(selected);
                  isClosed();
                }}
                isDisabled={selected === ""}
                startContent={<DeleteRoundedIcon />}
                radius="full"
              >
                Conferma eliminazione
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
