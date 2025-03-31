import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
} from "@heroui/react";
import { API_URL_IMG } from "../../../../API/API";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { cn } from "../../../../lib/utils";

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

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    link: Link
  ) => {
    e.currentTarget.src =
      API_URL_IMG + "/linkIcons/" + link.ProjectLinkTypeImage;
  };

  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    link: Link
  ) => {
    if (link.ProjectLinkTypeId.toString() === "7") {
      const img = e.target as HTMLImageElement;
      const scale =
        Math.min(32 / img.naturalWidth, 32 / img.naturalHeight) * 4.5;
      img.style.transform = `scale(${scale})`;
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      return `https://www.google.com/s2/favicons?domain=${
        new URL(url).hostname
      }&sz=128`;
    } catch {
      return "";
    }
  };

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
              <h3 className="text-xl font-medium">Rimuovi collegamento:</h3>
            </ModalHeader>
            <ModalBody>
              <RadioGroup
                label="Seleziona il link da rimuovere:"
                value={selected}
                onValueChange={setSelected}
              >
                {LinkData.map((link: Link) => (
                  <Radio
                    value={link.ProjectLinkId.toString()}
                    key={link.ProjectLinkId}
                  >
                    <span className="flex flex-row justify-center items-center gap-3">
                      <img
                        src={
                          link.ProjectLinkTypeId.toString() === "7"
                            ? getFaviconUrl(link.ProjectLinkUrl)
                            : API_URL_IMG +
                              "/linkIcons/" +
                              link.ProjectLinkTypeImage
                        }
                        className={cn("h-5 w-5 object-contain", {
                          "scale-[2.5] object-cover":
                            link.ProjectLinkTypeId.toString() === "7",
                        })}
                        onLoad={(e) => handleImageLoad(e, link)}
                        onError={(e) => handleImageError(e, link)}
                        alt={`Icon for ${link.ProjectLinkTitle}`}
                      />
                      <h1>{link.ProjectLinkTitle}</h1>
                    </span>
                  </Radio>
                ))}
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
                  setSelected("");
                  isClosed();
                }}
                isDisabled={selected === ""}
                startContent={
                  <Icon icon="solar:trash-bin-trash-linear" fontSize={24} />
                }
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
