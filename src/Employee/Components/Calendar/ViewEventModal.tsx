import {
  Button,
  Chip,
  DateValue,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
  Accordion,
  AccordionItem,
  DropdownTrigger,
  Dropdown,
  Input,
  DropdownMenu,
  DropdownItem,
  DatePicker,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { Icon } from "@iconify/react";
import { I18nProvider, useDateFormatter } from "@react-aria/i18n";
import axios from "axios";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles
import EventAttachmentUploaderModal from "./EventAttachmentUploaderModal";
import FileCard from "../Project/Other/ProjectFiles/FileCard";
import ConfirmDeleteEventModal from "./ConfirmDeleteEventModal";
import { io, Socket } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../API/API";
import { Spinner } from "@heroui/react";
import { TimeInput } from "@heroui/react";

const socket: Socket = io(API_WEBSOCKET_URL);

dayjs.extend(utc);
dayjs.extend(timezone);

interface EventPartecipant {
  EventPartecipantEmail: string;
  EventPartecipantRole: string;
  EventPartecipantStatus: string;
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
  EventTagName: string;
  EventAttachments: EventAttachment[];
  EventPartecipants: EventPartecipant[];
}

interface ViewEventModalProps {
  isOpen: boolean;
  eventId: number;
  isClosed: () => void;
}

interface EventTag {
  EventTagId: number;
  EventTagName: string;
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
  EventTagName: "",
  EventAttachments: [],
  EventPartecipants: [],
};

const colors = [
  { color: "#EF4444", name: "Rosso" },
  { color: "#F59E0B", name: "Arancione" },
  { color: "#10B981", name: "Verde" },
  { color: "#3B82F6", name: "Blu" },
  { color: "#6366F1", name: "Viola" },
];

function convertToDateValue(dateString: string) {
  const date = dayjs(dateString);
  return parseDate(
    `${date.year()}-${(date.month() + 1).toString().padStart(2, "0")}-${date
      .date()
      .toString()
      .padStart(2, "0")}`
  );
}

function stringToTimeValue(timeString: string): any {
  const [hour, minute] = timeString.split(":").map(Number);
  return { hour, minute, second: 0, millisecond: 0 }; // Adjust as necessary
}

export default function ViewEventModal({
  isOpen,
  eventId,
  isClosed,
}: ViewEventModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingData, setIsAddingData] = useState(false);
  const [newEvent, setNewEvent] = useState<CalendarEvent>(INITIAL_EVENT_DATA);
  const [modalUploadFile, setModalUploadFile] = useState({
    open: false,
  });
  const [users, setUsers] = useState<EventPartecipant[]>([]);
  const [tags, setTags] = useState<EventTag[]>([]);
  const [Partecipants, setPartecipants] = useState<EventPartecipant[]>([]);
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
                EventPartecipantStatus: "In Attesa",
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
                EventPartecipantStatus: "In Attesa",
              },
            ];
          });
        }
      });
  }

  useEffect(() => {
    socket.on("event-update", (eventId: number) => {
      if (eventId === newEvent.EventId) {
        fetchEvent();
      }
    });
    socket.on("file-update", (eventId: number) => {
      if (eventId === newEvent.EventId) {
        fetchEvent();
      }
    });
    fetchUsers();
    fetchTags();
  }, []);

  async function fetchEvent() {
    if (eventId === 0) return;
    const res = await axios.get(`/Calendar/GET/GetEventByEventId`, {
      params: {
        eventId: eventId,
      },
    });
    setNewTag({
      EventTagId: res.data.EventTagId,
      EventTagName:
        tags.find((t) => t.EventTagId === res.data.EventTagId)?.EventTagName ||
        "",
    });
    setPartecipants(res.data.EventPartecipants);

    // Convert the dates to DateValue format when setting event data
    const eventData = {
      ...res.data,
      EventStartDate: convertToDateValue(res.data.EventStartDate),
      EventEndDate: convertToDateValue(res.data.EventEndDate),
    };
    setNewEvent(eventData);
  }

  const formatter = useDateFormatter({ dateStyle: "full" });
  function formatDate(date: DateValue) {
    if (!date) return "Nessuna scadenza";
    return dayjs(formatter.format(new Date(date.toString()))).format(
      "DD MMM YYYY"
    );
  }

  useEffect(() => {
    fetchEvent();
  }, [eventId, isOpen]);

  function deletePartecipant(email: string) {
    setPartecipants(
      Partecipants.filter((p) => p.EventPartecipantEmail !== email)
    );
  }

  function addPartecipant(email: string, role: string) {
    setPartecipants([
      ...Partecipants,
      {
        EventPartecipantEmail: email,
        EventPartecipantRole: role,
        EventPartecipantStatus: "In Attesa",
      },
    ]);
  }

  async function handleUpdateEvent() {
    setIsAddingData(true);
    console.log(newEvent);
    const res = await axios.put("/Calendar/UPDATE/UpdateEvent", {
      Partecipants: Partecipants,
      Tag: newTag.EventTagId,
      EventData: {
        ...newEvent,
        EventStartDate: new Date(newEvent.EventStartDate.toString()),
        EventEndDate: new Date(newEvent.EventEndDate.toString()),
      },
    });

    if (res.status === 200) {
      socket.emit("calendar-update");
      setIsAddingData(false);
      handleCloseModal();
    }
  }

  async function DeleteEvent() {
    const res = await axios.delete(`/Calendar/DELETE/DeleteEvent`, {
      params: {
        EventId: eventId,
      },
    });

    if (res.status === 200) {
      socket.emit("calendar-update");
      handleCloseModal();
    }
  }

  function handleCloseModal() {
    setIsEditing(false);
    setNewEvent(INITIAL_EVENT_DATA);
    isClosed();
  }

  function handleExportEvent() {
    // Format date and time for ICS file
    const formatICSDateTime = (date: DateValue, time: string) => {
      const dateStr = dayjs(date.toString())
        .tz("Europe/Rome")
        .format("YYYYMMDD");
      const timeStr = time.replace(":", "") + "00";
      return `${dateStr}T${timeStr}`;
    };

    let startDateTime = formatICSDateTime(
      newEvent.EventStartDate,
      newEvent.EventStartTime
    );
    let endDateTime = formatICSDateTime(
      newEvent.EventEndDate,
      newEvent.EventEndTime
    );

    // Create ICS content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VTIMEZONE
TZID:Europe/Rome
LAST-MODIFIED:20240422T053451Z
TZURL:https://www.tzurl.org/zoneinfo-outlook/Europe/Rome
X-LIC-LOCATION:Europe/Rome
BEGIN:DAYLIGHT
TZNAME:CEST
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZNAME:CET
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
DTSTAMP:${formatICSDateTime(
      parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      dayjs(new Date()).format("HH:mm")
    )}
UID:${Date.now()}@calendar-app
DTSTART;TZID=Europe/Rome:${startDateTime}
DTEND;TZID=Europe/Rome:${endDateTime}
SUMMARY:${newEvent.EventTitle}
DESCRIPTION:${newEvent.EventDescription.replace(/\n/g, "\\n")}
LOCATION:${newEvent.EventLocation}
END:VEVENT
END:VCALENDAR`;

    // Create and download the file
    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${newEvent.EventTitle}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function DeleteFile(index: number) {
    const res = await axios.delete(`/Calendar/DELETE/DeleteEventAttachment`, {
      params: {
        EventAttachmentId: newEvent.EventAttachments[index].EventAttachmentId,
        EventAttachmentUrl: newEvent.EventAttachments[index].EventAttachmentUrl,
      },
    });

    if (res.status === 200) {
      socket.emit("event-update", eventId);
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
        // Utilizziamo una dimensione di default che su dispositivi piccoli occupa tutta la larghezza e su schermi medi/grandi è limitata
        size="3xl"
        scrollBehavior="outside"
        placement="center"
        backdrop="blur"
        hideCloseButton
      >
        <ModalContent className="w-full sm:max-w-3xl mx-auto">
          {() => (
            <>
              {!isEditing ? (
                <>
                  <ModalHeader className="flex flex-col sm:flex-row justify-between items-center gap-1">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 px-2 w-full">
                      <Icon icon="solar:calendar-linear" fontSize={18} />
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 w-full">
                        <p className="text-lg font-medium">
                          {newEvent.EventTitle}
                        </p>
                        <div
                          className="h-5 w-5 rounded-full"
                          style={{
                            backgroundColor: newEvent.EventColor,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        isIconOnly
                        color="warning"
                        variant="light"
                        radius="full"
                        startContent={
                          <Icon icon="solar:pen-linear" fontSize={18} />
                        }
                        onPress={() => setIsEditing(true)}
                        size="sm"
                      />
                      <Button
                        color="primary"
                        variant="light"
                        radius="full"
                        onPress={handleExportEvent}
                        size="sm"
                        isIconOnly
                        startContent={
                          <Icon icon="solar:download-linear" fontSize={18} />
                        }
                      />
                      <ConfirmDeleteEventModal
                        EventData={newEvent}
                        DeleteEvent={DeleteEvent}
                      />
                    </div>
                  </ModalHeader>
                  <ModalBody>
                    <div className="mt-4">
                      <dl>
                        <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0 w-full">
                          <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                            <Icon icon="solar:calendar-linear" fontSize={18} />
                            Data e ora
                          </dt>
                          <dd className="flex flex-col gap-2 mt-1 text-sm leading-6 text-gray-700 sm:mt-0 w-full">
                            <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
                              <I18nProvider locale="it">
                                <p>{formatDate(newEvent.EventStartDate)}</p>
                                <p>{newEvent.EventStartTime}</p>
                              </I18nProvider>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
                              <I18nProvider locale="it">
                                <p>{formatDate(newEvent.EventEndDate)}</p>
                                <p>{newEvent.EventEndTime}</p>
                              </I18nProvider>
                            </div>
                          </dd>
                        </div>

                        {newEvent.EventDescription && (
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
                                readOnly
                                className="h-fit"
                                theme="bubble"
                                value={newEvent.EventDescription}
                              />
                            </dd>
                          </div>
                        )}

                        <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0">
                          <EventAttachmentUploaderModal
                            EventId={newEvent!.EventId}
                            isOpen={modalUploadFile.open}
                            isClosed={() =>
                              setModalUploadFile({
                                ...modalUploadFile,
                                open: false,
                              })
                            }
                          />
                          <Accordion variant="light" className="px-[-2px]">
                            <AccordionItem
                              key="1"
                              aria-label="Accordion 1"
                              title={
                                <div className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                                  <Icon
                                    icon="solar:paperclip-linear"
                                    fontSize={18}
                                  />
                                  Allegati
                                  <Chip
                                    color="primary"
                                    variant="faded"
                                    size="sm"
                                    radius="full"
                                  >
                                    {newEvent.EventAttachments &&
                                      newEvent.EventAttachments.length}
                                  </Chip>
                                </div>
                              }
                            >
                              <ScrollShadow className="flex flex-col gap-3 max-h-96">
                                <div className="flex flex-col gap-4 w-full">
                                  {newEvent.EventAttachments &&
                                    newEvent.EventAttachments.length > 0 &&
                                    newEvent.EventAttachments.map(
                                      (file, index) => (
                                        <FileCard
                                          file={file}
                                          index={index}
                                          DeleteFile={DeleteFile}
                                          key={index}
                                          variant="delete"
                                        />
                                      )
                                    )}
                                </div>
                                <Button
                                  radius="full"
                                  color="primary"
                                  startContent={
                                    <Icon
                                      icon="solar:upload-linear"
                                      fontSize={18}
                                    />
                                  }
                                  className="w-full sm:w-1/3"
                                  variant="solid"
                                  onClick={() =>
                                    setModalUploadFile({
                                      ...modalUploadFile,
                                      open: true,
                                    })
                                  }
                                  fullWidth
                                >
                                  Carica file
                                </Button>
                              </ScrollShadow>
                            </AccordionItem>
                          </Accordion>
                        </div>

                        <div className="flex flex-col sm:flex-row w-full gap-4">
                          <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0 w-full sm:w-1/2">
                            <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                              <Icon
                                icon="solar:users-group-rounded-linear"
                                fontSize={18}
                              />
                              Partecipanti
                            </dt>
                            <dd className="text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                              <div className="flex flex-wrap gap-2">
                                {newEvent.EventPartecipants &&
                                  newEvent.EventPartecipants.map(
                                    (Partecipant) => (
                                      <Chip
                                        key={Partecipant.EventPartecipantEmail}
                                        size="lg"
                                        variant="flat"
                                        startContent={
                                          Partecipant.EventPartecipantStatus ===
                                          "Accettato" ? (
                                            <Icon
                                              color="green"
                                              icon="solar:check-circle-linear"
                                              fontSize={18}
                                            />
                                          ) : Partecipant.EventPartecipantStatus ===
                                            "Rifiutato" ? (
                                            <Icon
                                              color="red"
                                              icon="solar:close-circle-linear"
                                              fontSize={18}
                                            />
                                          ) : (
                                            <Icon
                                              icon="solar:question-circle-linear"
                                              fontSize={18}
                                            />
                                          )
                                        }
                                        endContent={
                                          Partecipant.EventPartecipantRole ===
                                          "Organizzatore" ? (
                                            <div
                                              className="w-2 h-2 rounded-full"
                                              style={{
                                                backgroundColor: "#3B82F6",
                                              }}
                                            />
                                          ) : Partecipant.EventPartecipantRole ===
                                            "esterno" ? (
                                            <div
                                              className="w-2 h-2 rounded-full"
                                              style={{
                                                backgroundColor: "#EF4444",
                                              }}
                                            />
                                          ) : Partecipant.EventPartecipantRole ===
                                            "dipendente" ? (
                                            <div
                                              className="w-2 h-2 rounded-full"
                                              style={{
                                                backgroundColor: "#10B981",
                                              }}
                                            />
                                          ) : (
                                            <div
                                              className="w-2 h-2 rounded-full"
                                              style={{
                                                backgroundColor: "#EF4444",
                                              }}
                                            />
                                          )
                                        }
                                      >
                                        {Partecipant.EventPartecipantEmail}
                                      </Chip>
                                    )
                                  )}
                              </div>
                            </dd>
                          </div>
                          {newTag.EventTagName && (
                            <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0 w-full sm:w-1/2">
                              <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                                <Icon icon="solar:tag-linear" fontSize={18} />
                                Tag
                              </dt>
                              <dd className="text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
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
                              </dd>
                            </div>
                          )}
                        </div>
                        {newEvent.EventLocation && (
                          <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0">
                            <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                              <Icon
                                icon="basil:location-outline"
                                fontSize={18}
                              />
                              Location
                            </dt>
                            <dd className="mt-1 text-sm leading-6 text-gray-700">
                              <label>{newEvent.EventLocation}</label>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </ModalBody>
                  <ModalFooter className="flex justify-end gap-2">
                    <Button
                      color="primary"
                      variant="light"
                      onClick={handleCloseModal}
                      radius="full"
                    >
                      Chiudi
                    </Button>
                  </ModalFooter>
                </>
              ) : (
                <>
                  <ModalHeader className="flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 w-full">
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
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <dl className="col-span-1">
                        <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0 w-full">
                          <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                            <Icon icon="solar:calendar-linear" fontSize={18} />
                            Data e ora
                          </dt>
                          <dd className="flex flex-col gap-2 mt-1 text-sm leading-6 text-gray-700 w-full">
                            <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
                              <I18nProvider locale="it">
                                <DatePicker
                                  labelPlacement="outside"
                                  label="Data inizio"
                                  className="w-full sm:w-1/2"
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
                                  className="w-full sm:w-1/2"
                                  label="Ora inizio"
                                  labelPlacement="outside"
                                  value={stringToTimeValue(
                                    newEvent.EventStartTime
                                  )}
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
                            <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
                              <I18nProvider locale="it">
                                <DatePicker
                                  labelPlacement="outside"
                                  label="Data fine"
                                  className="w-full sm:w-1/2"
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
                                  className="w-full sm:w-1/2"
                                  label="Ora fine"
                                  labelPlacement="outside"
                                  value={stringToTimeValue(
                                    newEvent.EventEndTime
                                  )}
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

                      <div className="col-span-1">
                        <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0">
                          <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                            <Icon
                              icon="fluent:text-description-16-filled"
                              fontSize={18}
                            />
                            Descrizione
                          </dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700">
                            <ReactQuill
                              className="h-fit"
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
                              className="w-full mx-auto gap-3 my-5 py-2"
                              radius="full"
                              onClick={handleRefine}
                              isDisabled={
                                loading ||
                                !hasContent(newEvent.EventDescription)
                              }
                            >
                              {loading ? (
                                <>
                                  <Spinner size="sm" className="text-black" />{" "}
                                  Riscrittura in corso...
                                </>
                              ) : (
                                <>
                                  <Icon
                                    icon="solar:magic-stick-3-linear"
                                    fontSize={18}
                                  />{" "}
                                  Riscrivi con AI
                                </>
                              )}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row w-full gap-4">
                      <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0 w-full sm:w-1/2">
                        <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                          <Icon
                            icon="solar:users-group-rounded-linear"
                            fontSize={18}
                          />
                          Partecipanti
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700">
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
                                    users.find(
                                      (u) => u.EventPartecipantEmail === e
                                    )?.EventPartecipantRole || "esterno"
                                  );
                              }}
                              placeholder="Seleziona partecipanti"
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
                                          : "#3B82F6",
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

                      <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0 w-full sm:w-1/2">
                        <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                          <Icon icon="solar:tag-linear" fontSize={18} />
                          Tag
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700">
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

                    <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <Icon icon="basil:location-outline" fontSize={18} />
                        Location
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700">
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
                  <ModalFooter className="flex justify-end gap-2">
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
                        (!newTag.EventTagName && newTag.EventTagId === 0)
                      }
                      color="primary"
                      onClick={handleUpdateEvent}
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
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
