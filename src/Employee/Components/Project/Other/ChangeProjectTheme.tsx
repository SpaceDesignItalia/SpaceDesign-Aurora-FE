import {
  Button,
  Avatar,
  RadioGroup,
  Radio,
  cn,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import axios from "axios";
import { useState, useEffect } from "react";
import { API_URL_IMG } from "../../../../API/API";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  isClosed: () => void;
  ProjectId: number;
  ProjectBannerId: number;
}

interface Banner {
  ProjectBannerId: number;
  ProjectBannerPath: string;
}

export const CustomRadio = (props: any) => {
  const { children, ...otherProps } = props;

  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
          "flex-row cursor-pointer rounded-lg border-2 border-transparent",
          "data-[selected=true]:border-primary data-[selected=true]:bg-content2"
        ),
      }}
    >
      {children}
    </Radio>
  );
};

export default function ChangeProjectTheme({
  isOpen,
  isClosed,
  ProjectId,
  ProjectBannerId,
}: ConfirmDeleteModalProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [newBannerId, setNewBanner] = useState<number>(ProjectBannerId);

  useEffect(() => {
    // Sincronizza newBannerId con ProjectBannerId all'apertura del modal
    setNewBanner(ProjectBannerId);
  }, [ProjectBannerId]);

  useEffect(() => {
    axios.get("/Project/GET/GetAllBanners").then((res) => {
      setBanners(res.data);
    });
  }, []);

  async function handleUpdateTheme(e: any) {
    try {
      const res = await axios.put("/Project/UPDATE/UpdateProjectTheme", {
        ProjectId: ProjectId,
        ProjectBannerId: e.target.value,
      });

      if (res.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      /* window.location.reload(); */
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={isClosed}
      size="2xl"
      scrollBehavior="inside"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        {(isClosed) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold">Seleziona un tema</h3>
            </ModalHeader>
            <ModalBody>
              <RadioGroup
                orientation="horizontal"
                value={String(newBannerId)}
                onChange={handleUpdateTheme}
              >
                {banners.length > 0 &&
                  banners.map((banner) => (
                    <CustomRadio
                      key={banner.ProjectBannerId}
                      value={banner.ProjectBannerId.toString()}
                    >
                      <Avatar
                        radius="sm"
                        src={
                          API_URL_IMG + "/banners/" + banner.ProjectBannerPath
                        }
                      />
                    </CustomRadio>
                  ))}
              </RadioGroup>
            </ModalBody>
            <ModalFooter className="flex sm:flex-row flex-col">
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
