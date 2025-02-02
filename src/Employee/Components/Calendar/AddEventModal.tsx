import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Chip,
  DatePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import {
  CalendarMonthRounded as CalendarMonthRoundedIcon,
  CloseRounded as CloseRoundedIcon,
  NotesRounded as NotesRoundedIcon,
  SaveRounded as SaveRoundedIcon,
  PeopleRounded as PeopleRoundedIcon,
  LocalOfferRounded as LocalOfferRoundedIcon,
  LocationOnRounded as LocationOnRoundedIcon,
} from "@mui/icons-material";
import { I18nProvider } from "@react-aria/i18n";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles
import { io, Socket } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../API/API";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const socket: Socket = io(API_WEBSOCKET_URL);

interface EventPartecipant {
  EventPartecipantEmail: string;
  EventPartecipantRole: string;
}

interface EventAttachment {
  EventAttachmentId: number;
  EventAttachmentUrl: string;
  EventAttachmentName: string;
}

interface CalendarEvent {
  EventId: number;
  EventTitle: string;
  EventStartDate: any;
  EventEndDate: any;
  EventStartTime: string;
  EventEndTime: string;
  EventColor: string;
  EventDescription: string;
  EventLocation: string;
  EventTagId: number;
  EventAttachments: EventAttachment[];
  EventPartecipants: EventPartecipant[];
}

interface EventTag {
  EventTagId: number;
  EventTagName: string;
}

interface AddEventModalProps {
  isOpen: boolean;
  isClosed: () => void;
  prefilledData: any | null;
}

const INITIAL_EVENT_DATA: CalendarEvent = {
  EventId: 0,
  EventTitle: "",
  EventStartDate: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
  EventEndDate: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
  EventStartTime: "",
  EventEndTime: "",
  EventColor: "",
  EventDescription: "",
  EventLocation: "",
  EventTagId: 0,
  EventAttachments: [],
  EventPartecipants: [],
};

const colors = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#6366F1"];

export default function AddEventModal({
  isOpen,
  isClosed,
  prefilledData,
}: AddEventModalProps) {
  const navigate = useNavigate();
  const { Action } = useParams();
  const [newEvent, setNewEvent] = useState<CalendarEvent>(INITIAL_EVENT_DATA);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [Partecipants, setPartecipants] = useState<EventPartecipant[]>([]);
  const [users, setUsers] = useState<EventPartecipant[]>([]);
  const [tags, setTags] = useState<EventTag[]>([]);
  const [newTag, setNewTag] = useState<EventTag>({
    EventTagId: 0,
    EventTagName: "",
  });

  async function fetchTags() {
    const res = await axios.get("/Calendar/GET/GetEventTags");
    setTags(res.data);
  }

  async function fetchUsers() {
    await axios
      .get("/Staffer/GET/GetAllStaffers", {
        withCredentials: true,
      })
      .then((res) => {
        for (const user of res.data) {
          setUsers((prevUsers) => {
            if (
              prevUsers.some(
                (u) => u.EventPartecipantEmail === user.EmployeeEmail
              )
            ) {
              return prevUsers;
            }
            return [
              ...prevUsers,
              {
                EventPartecipantEmail: user.EmployeeEmail,
                EventPartecipantRole: "dipendente",
              },
            ];
          });
        }
      });

    await axios
      .get("/Customer/GET/GetAllCustomers", {
        withCredentials: true,
      })
      .then((res) => {
        for (const customer of res.data) {
          setUsers((prevUsers) => {
            if (
              prevUsers.some(
                (u) => u.EventPartecipantEmail === customer.CustomerEmail
              )
            ) {
              return prevUsers;
            }
            return [
              ...prevUsers,
              {
                EventPartecipantEmail: customer.CustomerEmail,
                EventPartecipantRole: "cliente",
              },
            ];
          });
        }
      });
  }

  useEffect(() => {
    if (prefilledData) {
      setNewEvent({
        ...INITIAL_EVENT_DATA,
        EventTitle: prefilledData.title,
        EventStartDate: parseDate(prefilledData.startDate),
        EventEndDate: parseDate(prefilledData.endDate),
        EventStartTime: prefilledData.startTime,
        EventEndTime: prefilledData.endTime,
        EventDescription: prefilledData.description,
        EventLocation: prefilledData.location,
      });
    }
    fetchUsers();
    fetchTags();
  }, [prefilledData]);

  async function handleAddEvent() {
    try {
      setIsAddingData(true);

      newEvent.EventTagId = newTag.EventTagId;
      newEvent.EventPartecipants = Partecipants;

      const res = await axios.post("/Calendar/POST/AddEvent", {
        EventData: {
          ...newEvent,
          EventStartDate: new Date(newEvent.EventStartDate.toString()),
          EventEndDate: new Date(newEvent.EventEndDate.toString()),
        },
      });
      if (res.status === 200) {
        socket.emit("calendar-update");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
      }
    } finally {
      setIsAddingData(false);
      handleCloseModal();
    }
  }

  function deletePartecipant(email: string) {
    setPartecipants(
      Partecipants.filter((p) => p.EventPartecipantEmail !== email)
    );
  }

  function addPartecipant(email: string, role: string) {
    setPartecipants([
      ...Partecipants,
      { EventPartecipantEmail: email, EventPartecipantRole: role },
    ]);
  }

  function handleCloseModal() {
    setNewEvent(INITIAL_EVENT_DATA);
    isClosed();
    if (Action) {
      navigate(`/comunications/calendar/`);
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={handleCloseModal}
        size="3xl"
        scrollBehavior="outside"
        placement="center"
        backdrop="blur"
        hideCloseButton
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-row justify-between items-center gap-2">
                <div className="flex flex-row justify-between items-center gap-2 w-full">
                  <CalendarMonthRoundedIcon />
                  <Input
                    className="w-full"
                    variant="underlined"
                    color="primary"
                    placeholder="Titolo dell'evento"
                    value={newEvent.EventTitle}
                    maxLength={50}
                    onChange={(e) => {
                      setNewEvent({
                        ...newEvent,
                        EventTitle: e.target.value,
                      });
                    }}
                    endContent={
                      <div className="text-sm">
                        {newEvent.EventTitle.length}/50
                      </div>
                    }
                  />
                  <Dropdown className="w-2">
                    <DropdownTrigger className="w-2 h-2">
                      <Button
                        className="h-5 w-2"
                        size="sm"
                        radius="full"
                        style={{
                          backgroundColor: newEvent.EventColor,
                        }}
                      />
                    </DropdownTrigger>
                    <DropdownMenu>
                      {colors.map((color) => (
                        <DropdownItem
                          startContent
                          key={color}
                          onPress={() => {
                            setNewEvent((prev) => ({
                              ...prev,
                              EventColor: color,
                            }));
                          }}
                        >
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color }}
                          ></div>
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                  <Button
                    color="primary"
                    variant="light"
                    onClick={handleCloseModal}
                    radius="full"
                    size="sm"
                    isIconOnly
                    startContent={
                      <CloseRoundedIcon
                        sx={{ fontSize: 17 }}
                        className="text-gray-700"
                      />
                    }
                  />
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="mt-4">
                  <dl>
                    <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0 w-full">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <CalendarMonthRoundedIcon />
                        Data e ora
                      </dt>
                      <dd className="flex flex-col gap-2 mt-1 text-sm leading-6 text-gray-700 sm:mt-0 w-full">
                        <div className="flex flex-row justify-between w-full gap-4">
                          <I18nProvider locale="it">
                            <DatePicker
                              labelPlacement="outside"
                              label="Data inizio"
                              className="w-1/2"
                              radius="full"
                              variant="bordered"
                              value={newEvent.EventStartDate}
                              onChange={(date) =>
                                setNewEvent((prev) => ({
                                  ...prev,
                                  EventStartDate: date,
                                }))
                              }
                            />
                            <Input
                              type="time"
                              label="Ora inizio"
                              className="w-1/2"
                              value={newEvent.EventStartTime}
                              onChange={(e) =>
                                setNewEvent((prev) => ({
                                  ...prev,
                                  EventStartTime: e.target.value,
                                }))
                              }
                            />
                          </I18nProvider>
                        </div>
                        <div className="flex flex-row justify-between w-full gap-4">
                          <I18nProvider locale="it">
                            <DatePicker
                              labelPlacement="outside"
                              label="Data fine"
                              className="w-1/2"
                              radius="full"
                              variant="bordered"
                              value={newEvent.EventEndDate}
                              onChange={(date) =>
                                setNewEvent((prev) => ({
                                  ...prev,
                                  EventEndDate: date,
                                }))
                              }
                            />
                            <Input
                              type="time"
                              label="Ora fine"
                              className="w-1/2"
                              value={newEvent.EventEndTime}
                              onChange={(e) =>
                                setNewEvent((prev) => ({
                                  ...prev,
                                  EventEndTime: e.target.value,
                                }))
                              }
                            />
                          </I18nProvider>
                        </div>
                      </dd>
                    </div>

                    <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <NotesRoundedIcon />
                        Descrizione
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        <ReactQuill
                          className="sm:col-span-2 sm:mt-0 h-fit"
                          theme="snow"
                          value={newEvent.EventDescription}
                          onChange={(content) =>
                            setNewEvent((prev) => ({
                              ...prev,
                              EventDescription: content,
                            }))
                          }
                        />
                      </dd>
                    </div>

                    <div className="flex flex-row w-full gap-4">
                      <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0 w-1/2">
                        <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                          <PeopleRoundedIcon />
                          Partecipanti
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          <div className="flex flex-row gap-2">
                            <Autocomplete
                              defaultItems={users}
                              onSelectionChange={(e) => {
                                e &&
                                  e.toString() &&
                                  addPartecipant(
                                    e?.toString() || "",
                                    Partecipants.find(
                                      (p) => p.EventPartecipantEmail === e
                                    )?.EventPartecipantRole || "cliente"
                                  );
                              }}
                              placeholder="Email"
                            >
                              {users.map((user) => (
                                <AutocompleteItem
                                  startContent={
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{
                                        backgroundColor:
                                          user.EventPartecipantRole ===
                                          "dipendente"
                                            ? "#EF4444" // red
                                            : "#3B82F6", // blue
                                      }}
                                    />
                                  }
                                  key={user.EventPartecipantEmail}
                                  value={user.EventPartecipantEmail}
                                >
                                  {user.EventPartecipantEmail}
                                </AutocompleteItem>
                              ))}
                            </Autocomplete>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Partecipants.map((Partecipant) => (
                              <Chip
                                key={Partecipant.EventPartecipantEmail}
                                size="lg"
                                variant="flat"
                                onClose={() =>
                                  deletePartecipant(
                                    Partecipant.EventPartecipantEmail
                                  )
                                }
                                startContent={
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                      backgroundColor:
                                        Partecipant.EventPartecipantRole ===
                                        "dipendente"
                                          ? "#EF4444" // red
                                          : "#3B82F6", // blue
                                    }}
                                  />
                                }
                              >
                                {Partecipant.EventPartecipantEmail}
                              </Chip>
                            ))}
                          </div>
                        </dd>
                      </div>

                      <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0 w-1/2">
                        <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                          <LocalOfferRoundedIcon />
                          Tag
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          <div className="flex flex-row gap-2">
                            <Autocomplete
                              defaultItems={tags}
                              onSelectionChange={(e) => {
                                e &&
                                  e.toString() &&
                                  setNewTag({
                                    EventTagId:
                                      tags.find((t) => t.EventTagName === e)
                                        ?.EventTagId || 0,
                                    EventTagName: e?.toString() || "",
                                  });
                              }}
                              placeholder="Tag"
                            >
                              {tags.map((tag) => (
                                <AutocompleteItem
                                  startContent={
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{
                                        backgroundColor: newEvent.EventColor,
                                      }}
                                    />
                                  }
                                  key={tag.EventTagName}
                                  value={tag.EventTagName}
                                >
                                  {tag.EventTagName}
                                </AutocompleteItem>
                              ))}
                            </Autocomplete>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {newTag.EventTagName && (
                              <Chip
                                key={newTag.EventTagName}
                                size="lg"
                                variant="flat"
                                onClose={() =>
                                  setNewTag({
                                    EventTagId: 0,
                                    EventTagName: "",
                                  })
                                }
                                startContent={
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                      backgroundColor: newEvent.EventColor,
                                    }}
                                  />
                                }
                              >
                                {newTag.EventTagName}
                              </Chip>
                            )}
                          </div>
                        </dd>
                      </div>
                    </div>
                    <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <LocationOnRoundedIcon />
                        Location
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        <Input
                          type="text"
                          placeholder="Location"
                          className="w-full"
                          value={newEvent.EventLocation}
                          onChange={(e) =>
                            setNewEvent((prev) => ({
                              ...prev,
                              EventLocation: e.target.value,
                            }))
                          }
                        />
                      </dd>
                    </div>
                  </dl>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  variant="light"
                  onClick={handleCloseModal}
                  radius="full"
                >
                  Chiudi
                </Button>
                <Button
                  disabled={
                    !newEvent.EventTitle ||
                    !newEvent.EventStartDate ||
                    !newEvent.EventStartTime ||
                    !newEvent.EventEndDate ||
                    !newEvent.EventEndTime ||
                    !newEvent.EventColor ||
                    !newTag.EventTagName
                  }
                  color="primary"
                  onClick={handleAddEvent}
                  radius="full"
                  startContent={!isAddingData && <SaveRoundedIcon />}
                  isLoading={isAddingData}
                  variant="solid"
                >
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
