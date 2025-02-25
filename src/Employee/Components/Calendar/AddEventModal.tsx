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
  Spinner,
  TimeInput,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { Icon } from "@iconify/react";
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

const colors = [
  { color: "#EF4444", name: "Rosso" },
  { color: "#F59E0B", name: "Arancione" },
  { color: "#10B981", name: "Verde" },
  { color: "#3B82F6", name: "Blu" },
  { color: "#6366F1", name: "Viola" },
];

const INITIAL_EVENT_DATA: CalendarEvent = {
  EventId: 0,
  EventTitle: "",
  EventStartDate: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
  EventEndDate: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
  EventStartTime: "00:00",
  EventEndTime: "00:00",
  EventColor: colors[0].color,
  EventDescription: "",
  EventLocation: "",
  EventTagId: 0,
  EventAttachments: [],
  EventPartecipants: [],
};

function stringToTimeValue(timeString: string): any {
  const [hour, minute] = timeString.split(":").map(Number);
  return { hour, minute, second: 0, millisecond: 0 }; // Adjust as necessary
}

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
  const [loading, setLoading] = useState<boolean>(false);

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

      if (newEvent.EventStartTime.split(":")[1].length == 1) {
        newEvent.EventStartTime =
          newEvent.EventStartTime.split(":")[0] +
          ":" +
          newEvent.EventStartTime.split(":")[1] +
          "0";
      }

      if (newEvent.EventEndTime.split(":")[1].length == 1) {
        newEvent.EventEndTime =
          newEvent.EventEndTime.split(":")[0] +
          ":" +
          newEvent.EventEndTime.split(":")[1] +
          "0";
      }

      const res = await axios.post("/Calendar/POST/AddEvent", {
        EventData: {
          ...newEvent,
          EventStartDate: new Date(newEvent.EventStartDate.toString()),
          EventEndDate: new Date(newEvent.EventEndDate.toString()),
        },
      });
      if (res.status === 200) {
        socket.emit("calendar-update");
        setPartecipants([]);
        setNewTag({
          EventTagId: 0,
          EventTagName: "",
        });
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
    setPartecipants([]);
    setNewTag({
      EventTagId: 0,
      EventTagName: "",
    });
    isClosed();
    if (Action) {
      navigate(`/comunications/calendar/`);
    }
  }

  const handleRefine = async () => {
    if (!newEvent.EventDescription) return;
    setLoading(true);
    try {
      const refinedText = await axios.post(
        "/Project/POST/RefineEventDescription",
        {
          eventDescription: `Riscrivi in modo più formale e completo il seguente testo: ${newEvent.EventDescription}`,
        }
      );
      setNewEvent({
        ...newEvent,
        EventDescription: refinedText.data,
      });
    } catch (error) {
      console.error("Errore:", error);
      alert("Si è verificato un errore.");
    } finally {
      setLoading(false);
    }
  };

  function hasContent(html: string | undefined): boolean {
    if (!html) return false;
    const div = document.createElement("div");
    div.innerHTML = html;
    return Boolean(div.textContent?.trim().length);
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
                  <Icon icon="solar:calendar-linear" fontSize={18} />
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
                  <Dropdown className="w-[100px]">
                    <DropdownTrigger className="w-6 h-5">
                      <div
                        className="w-6 h-5 rounded-full cursor-pointer"
                        style={{
                          backgroundColor: newEvent.EventColor,
                        }}
                      />
                    </DropdownTrigger>
                    <DropdownMenu selectedKeys={newEvent.EventColor}>
                      {colors.map((color) => (
                        <DropdownItem
                          startContent={
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color.color }}
                            />
                          }
                          key={color.name}
                          onPress={() => {
                            setNewEvent((prev) => ({
                              ...prev,
                              EventColor: color.color,
                            }));
                          }}
                        >
                          {color.name}
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
                      <Icon
                        icon="material-symbols:close-rounded"
                        fontSize={18}
                      />
                    }
                  />
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="mt-4 grid md:grid-cols-2 grid-cols-1 gap-4">
                  <dl className="col-span-2">
                    <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0 w-full">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <Icon icon="solar:calendar-linear" fontSize={18} />
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
                            <TimeInput
                              variant="bordered"
                              radius="full"
                              className="w-1/2"
                              label="Ora inizio"
                              labelPlacement="outside"
                              value={stringToTimeValue(newEvent.EventStartTime)}
                              onChange={(e) => {
                                if (e) {
                                  setNewEvent((prev) => ({
                                    ...prev,
                                    EventStartTime: `${e.hour}:${e.minute}`,
                                  }));
                                }
                              }}
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
                            <TimeInput
                              variant="bordered"
                              radius="full"
                              className="w-1/2"
                              label="Ora fine"
                              labelPlacement="outside"
                              value={stringToTimeValue(newEvent.EventEndTime)}
                              onChange={(e) => {
                                if (e) {
                                  setNewEvent((prev) => ({
                                    ...prev,
                                    EventEndTime: `${e.hour}:${e.minute}`,
                                  }));
                                }
                              }}
                            />
                          </I18nProvider>
                        </div>
                      </dd>
                    </div>
                  </dl>
                  <div className="col-span-2">
                    <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <Icon
                          icon="fluent:text-description-16-filled"
                          fontSize={18}
                        />
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
                      {newEvent.EventDescription &&
                      hasContent(newEvent.EventDescription) ? (
                        <Button
                          variant="bordered"
                          className="w-max-1/2 mx-auto gap-3 my-5 sm:my-0 py-2"
                          radius="full"
                          onClick={handleRefine}
                          isDisabled={
                            loading || !hasContent(newEvent.EventDescription)
                          }
                        >
                          {loading ? (
                            <>
                              {" "}
                              <Spinner size="sm" className="text-black" />{" "}
                              Riscrittura in corso...{" "}
                            </>
                          ) : (
                            <>
                              {" "}
                              <Icon
                                icon="solar:magic-stick-3-linear"
                                fontSize={18}
                              />{" "}
                              Riscrivi con AI{" "}
                            </>
                          )}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-row w-full gap-4 col-span-2">
                  <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0 w-1/2">
                    <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                      <Icon
                        icon="solar:users-group-rounded-linear"
                        fontSize={18}
                      />
                      Partecipanti
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      <div className="flex flex-col gap-2">
                        <Autocomplete
                          variant="bordered"
                          radius="full"
                          defaultItems={users}
                          onSelectionChange={(e) => {
                            e &&
                              e.toString() &&
                              addPartecipant(
                                e?.toString() || "",
                                users.find((u) => u.EventPartecipantEmail === e)
                                  ?.EventPartecipantRole || "esterno"
                              );
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const input = e.currentTarget.value;
                              if (
                                input &&
                                input.includes("@") &&
                                !users.some(
                                  (u) => u.EventPartecipantEmail === input
                                )
                              ) {
                                addPartecipant(input, "esterno");
                                e.currentTarget.value = "";
                              }
                            }
                          }}
                          placeholder="Seleziona partecipanti"
                          listboxProps={{
                            emptyContent:
                              "Inserisci l'indirizzo email se il partecipante non è presente in lista",
                          }}
                        >
                          {users.map((user) => (
                            <AutocompleteItem
                              startContent={
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor:
                                      user.EventPartecipantRole === "dipendente"
                                        ? "#EF4444"
                                        : "#3B82F6",
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
                                      ? "#EF4444"
                                      : Partecipant.EventPartecipantRole ===
                                        "cliente"
                                      ? "#3B82F6"
                                      : "#10B981", // Green for external participants
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
                      <Icon icon="solar:tag-linear" fontSize={18} />
                      Tag
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      <div className="flex flex-row gap-2">
                        <Autocomplete
                          variant="bordered"
                          radius="full"
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

                <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0 w-full">
                  <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                    <Icon icon="basil:location-outline" fontSize={18} />
                    Location
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    <Input
                      variant="bordered"
                      radius="full"
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
                    !newEvent.EventColor
                  }
                  color="primary"
                  onClick={handleAddEvent}
                  radius="full"
                  startContent={
                    !isAddingData && (
                      <Icon icon="basil:save-outline" fontSize={24} />
                    )
                  }
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
