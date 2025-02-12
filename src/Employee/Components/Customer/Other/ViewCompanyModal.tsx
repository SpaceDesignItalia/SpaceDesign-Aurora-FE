import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  Card,
  CardHeader,
  CardBody,
  Avatar,
  cn,
  Tabs,
  Tab,
} from "@heroui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL_IMG } from "../../../../API/API";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
interface Company {
  CompanyId: number;
  CompanyName: string;
  CompanyAddress: string;
  CompanyEmail: string;
  CompanyPhone: string;
  CompanyImageUrl: string;
}

interface Member {
  customerfullname: string;
  CustomerEmail: string;
  CustomerPhone: string | null;
  CustomerImageUrl: string;
}

interface ViewCompanyModalProps {
  isOpen: boolean;
  isClosed: () => void;
  CompanyData: Company;
}

interface UserPostProps {
  avatar: string;
  name: string;
  username: string;
  text: string;
}

export default function ViewCompanyModal({
  isOpen,
  isClosed,
  CompanyData,
}: ViewCompanyModalProps) {
  const [companyMembers, setCompanyMembers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/Company/GET/GetCompanyMembersById", {
        params: { CompanyId: CompanyData.CompanyId },
      })
      .then((res) => {
        setCompanyMembers(res.data);
      });
  }, [isOpen]);

  const UserPost = ({
    avatar,
    name,
    username,
    text,
    ...props
  }: UserPostProps) => (
    <div className="mb-4 flex items-center gap-4" {...props}>
      <Avatar className="flex" size="md" src={avatar} />
      <div className="flex flex-col justify-center">
        <div className="flex gap-1 text-small">
          <p>{name}</p>
        </div>
        <p className="text-sm text-default-400">{username}</p>
        <p className="text-xs text-default-400">{text}</p>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {
        isClosed();
        navigate("/administration/customer");
      }}
      scrollBehavior="outside"
      backdrop="blur"
      className="w-0 h-0 absolute top-[25%]"
      hideCloseButton
    >
      <ModalContent>
        {(isClosed) => (
          <>
            <ModalBody className="flex justify-center items-center">
              <Card className="w-[400px]">
                <CardHeader className="relative flex h-[100px] flex-col justify-end overflow-visible bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400">
                  {CompanyData.CompanyImageUrl && (
                    <Avatar
                      className="h-20 w-20 translate-y-12"
                      src={
                        API_URL_IMG +
                        "/profileIcons/" +
                        CompanyData.CompanyImageUrl
                      }
                    />
                  )}
                  <div className="absolute right-3 top-3 flex flex-row gap-2">
                    <Button
                      className="bg-white/20 text-white dark:bg-black/20"
                      radius="full"
                      size="sm"
                      variant="light"
                      href={
                        "/administration/customer/edit-company/" +
                        CompanyData.CompanyId +
                        "/" +
                        CompanyData.CompanyName
                      }
                      as="a"
                    >
                      Modifica
                    </Button>
                    <Button
                      className="bg-white/20 text-white dark:bg-black/20 h-8 w-8"
                      radius="full"
                      isIconOnly
                      variant="light"
                      onPress={() => {
                        isClosed();
                        navigate("/administration/customer");
                      }}
                      startContent={
                        <Icon
                          icon="material-symbols:close-rounded"
                          fontSize={24}
                        />
                      }
                    />
                  </div>
                </CardHeader>
                <CardBody>
                  <div
                    className={cn(
                      CompanyData.CompanyImageUrl && "pt-6",
                      "pb-4"
                    )}
                  >
                    <p className="text-large font-medium">
                      {CompanyData.CompanyName}
                    </p>
                    <p className="max-w-[90%] text-small text-default-400">
                      {CompanyData.CompanyEmail}
                    </p>
                    <div className="flex gap-2 pb-1 pt-2">
                      <span className="inline-flex my-auto items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium text-gray-900 ring-2 ring-inset ring-gray-200 bg-white">
                        <svg
                          viewBox="0 0 6 6"
                          aria-hidden="true"
                          className="h-1.5 w-1.5 fill-blue-500"
                        >
                          <circle r={3} cx={3} cy={3} />
                        </svg>
                        {CompanyData.CompanyAddress}
                      </span>
                    </div>
                    {CompanyData.CompanyPhone && (
                      <p className="py-2 text-small text-foreground">
                        +39 {CompanyData.CompanyPhone}
                      </p>
                    )}
                  </div>
                  {companyMembers.length > 0 && (
                    <Tabs
                      fullWidth
                      classNames={{
                        panel: "mt-2",
                      }}
                    >
                      <Tab key="projects" title="Progetti">
                        {companyMembers.length > 0 &&
                          companyMembers.map((member: Member) => (
                            <UserPost
                              key={member.CustomerEmail}
                              avatar={
                                member.CustomerImageUrl
                                  ? API_URL_IMG +
                                    "/profileIcons/" +
                                    member.CustomerImageUrl
                                  : ""
                              }
                              name={member.customerfullname}
                              text={member.CustomerPhone || ""}
                              username={member.CustomerEmail}
                            />
                          ))}
                      </Tab>
                    </Tabs>
                  )}
                </CardBody>
              </Card>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
