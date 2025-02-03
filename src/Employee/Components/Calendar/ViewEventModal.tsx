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
import {
  CalendarMonthRounded as CalendarMonthRoundedIcon,
  LocalOfferRounded as LocalOfferRoundedIcon,
  LocationOnRounded as LocationOnRoundedIcon,
  NotesRounded as NotesRoundedIcon,
  PeopleRounded as PeopleRoundedIcon,
  HelpOutlineRounded as HelpOutlineRoundedIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  HighlightOff as HighlightOffIcon,
  AttachFileRounded as AttachFileRoundedIcon,
  NoteAddRounded as NoteAddRoundedIcon,
  EditRounded,
  CloseRounded as CloseRoundedIcon,
  SaveRounded as SaveRoundedIcon,
  AutoFixHighRounded,
} from "@mui/icons-material";
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

const MAX_DESCRIPTION_LENGTH = 500;

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

const colors = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#6366F1"];

function convertToDateValue(dateString: string) {
  const date = dayjs(dateString);
  return parseDate(
    `${date.year()}-${(date.month() + 1).toString().padStart(2, "0")}-${date
      .date()
      .toString()
      .padStart(2, "0")}`
  );
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
        size="3xl"
        scrollBehavior="outside"
        placement="center"
        backdrop="blur"
        hideCloseButton
      >
        <ModalContent>
          {() => (
            <>
              {!isEditing ? (
                <>
                  <ModalHeader className="flex flex-row justify-between items-center gap-2">
                    <div className="flex flex-row justify-between items-center gap-2 w-full">
                      <CalendarMonthRoundedIcon />
                      <div className="flex flex-row justify-between items-center gap-2 w-full">
                        <p>{newEvent.EventTitle}</p>
                        <div
                          className="h-5 w-5 rounded-full"
                          style={{
                            backgroundColor: newEvent.EventColor,
                          }}
                        />
                      </div>
                    </div>
                    <Button
                      isIconOnly
                      color="warning"
                      variant="light"
                      radius="full"
                      startContent={<EditRounded sx={{ fontSize: 17 }} />}
                      onPress={() => setIsEditing(true)}
                      size="sm"
                    />
                    <ConfirmDeleteEventModal
                      EventData={newEvent}
                      DeleteEvent={DeleteEvent}
                    />
                    <Button
                      color="primary"
                      variant="light"
                      radius="full"
                      onClick={handleExportEvent}
                    >
                      Esporta evento
                    </Button>
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
                                <p>{formatDate(newEvent.EventStartDate)}</p>
                                <p>{newEvent.EventStartTime}</p>
                              </I18nProvider>
                            </div>
                            <div className="flex flex-row justify-between w-full gap-4">
                              <I18nProvider locale="it">
                                <p>{formatDate(newEvent.EventEndDate)}</p>
                                <p>{newEvent.EventEndTime}</p>
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
                            {isEditing ? (
                              <div className="flex flex-col gap-1">
                                <ReactQuill
                                  className="sm:col-span-2 sm:mt-0 h-fit"
                                  theme="snow"
                                  value={newEvent.EventDescription}
                                  onChange={(content) => {
                                    if (
                                      content.length <= MAX_DESCRIPTION_LENGTH
                                    ) {
                                      setNewEvent((prev) => ({
                                        ...prev,
                                        EventDescription: content,
                                      }));
                                    }
                                  }}
                                />
                                <div className="text-sm text-right text-gray-500">
                                  {newEvent.EventDescription.length}/
                                  {MAX_DESCRIPTION_LENGTH}
                                </div>
                                {newEvent.EventDescription &&
                                  hasContent(newEvent.EventDescription) && (
                                    <Button
                                      variant="bordered"
                                      className="w-max-1/2 mx-auto gap-3 my-5 sm:my-0 py-2"
                                      radius="full"
                                      onClick={handleRefine}
                                      isDisabled={
                                        loading ||
                                        !hasContent(newEvent.EventDescription)
                                      }
                                    >
                                      {loading ? (
                                        <>
                                          {" "}
                                          <Spinner
                                            size="sm"
                                            className="text-black"
                                          />{" "}
                                          Riscrittura in corso...{" "}
                                        </>
                                      ) : (
                                        <>
                                          {" "}
                                          <AutoFixHighRounded className="w-5 h-5" />{" "}
                                          Riscrivi con AI{" "}
                                        </>
                                      )}
                                    </Button>
                                  )}
                              </div>
                            ) : (
                              <ReactQuill
                                readOnly
                                className="sm:col-span-2 sm:mt-0 h-fit"
                                theme="bubble"
                                value={newEvent.EventDescription}
                              />
                            )}
                          </dd>
                        </div>

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
                                  <AttachFileRoundedIcon />
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
                                  {newEvent.EventAttachments.length > 0 &&
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
                                  startContent={<NoteAddRoundedIcon />}
                                  className="w-1/3 sm:w-1/4"
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

                        <div className="flex flex-row w-full gap-4">
                          <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0 w-1/2">
                            <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                              <PeopleRoundedIcon />
                              Partecipanti
                            </dt>
                            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                              <div className="flex flex-wrap gap-2 mt-2">
                                {newEvent.EventPartecipants.map(
                                  (Partecipant) => (
                                    <Chip
                                      key={Partecipant.EventPartecipantEmail}
                                      size="lg"
                                      variant="flat"
                                      startContent={
                                        Partecipant.EventPartecipantStatus ===
                                        "In Attesa" ? (
                                          <HelpOutlineRoundedIcon />
                                        ) : Partecipant.EventPartecipantStatus ===
                                          "Accettato" ? (
                                          <CheckCircleOutlineIcon className="text-green-500" />
                                        ) : (
                                          <HighlightOffIcon className="text-red-500" />
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

                          <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0 w-1/2">
                            <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                              <LocalOfferRoundedIcon />
                              Tag
                            </dt>
                            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                              <div className="flex flex-row gap-2">
                                <label>{newEvent.EventTagName}</label>
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
                            <label>{newEvent.EventLocation}</label>
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
                  </ModalFooter>
                </>
              ) : (
                <>
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
                              {isEditing ? (
                                <div className="flex flex-col gap-1">
                                  <ReactQuill
                                    className="sm:col-span-2 sm:mt-0 h-fit"
                                    theme="snow"
                                    value={newEvent.EventDescription}
                                    onChange={(content) => {
                                      if (
                                        content.length <= MAX_DESCRIPTION_LENGTH
                                      ) {
                                        setNewEvent((prev) => ({
                                          ...prev,
                                          EventDescription: content,
                                        }));
                                      }
                                    }}
                                  />
                                  <div className="text-sm text-right text-gray-500">
                                    {newEvent.EventDescription.length}/
                                    {MAX_DESCRIPTION_LENGTH}
                                  </div>
                                  {newEvent.EventDescription &&
                                    hasContent(newEvent.EventDescription) && (
                                      <Button
                                        variant="bordered"
                                        className="w-max-1/2 mx-auto gap-3 my-5 sm:my-0 py-2"
                                        radius="full"
                                        onClick={handleRefine}
                                        isDisabled={
                                          loading ||
                                          !hasContent(newEvent.EventDescription)
                                        }
                                      >
                                        {loading ? (
                                          <>
                                            {" "}
                                            <Spinner
                                              size="sm"
                                              className="text-black"
                                            />{" "}
                                            Riscrittura in corso...{" "}
                                          </>
                                        ) : (
                                          <>
                                            {" "}
                                            <AutoFixHighRounded className="w-5 h-5" />{" "}
                                            Riscrivi con AI{" "}
                                          </>
                                        )}
                                      </Button>
                                    )}
                                </div>
                              ) : (
                                <ReactQuill
                                  readOnly
                                  className="sm:col-span-2 sm:mt-0 h-fit"
                                  theme="bubble"
                                  value={newEvent.EventDescription}
                                />
                              )}
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
                                    defaultSelectedKey={newEvent.EventTagName}
                                    onSelectionChange={(e) => {
                                      e &&
                                        e.toString() &&
                                        setNewTag({
                                          EventTagId:
                                            tags.find(
                                              (t) => t.EventTagName === e
                                            )?.EventTagId || 0,
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
                                              backgroundColor:
                                                newEvent.EventColor,
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
                                            backgroundColor:
                                              newEvent.EventColor,
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
                        onClick={handleUpdateEvent}
                        radius="full"
                        startContent={!isAddingData && <SaveRoundedIcon />}
                        isLoading={isAddingData}
                        variant="solid"
                      >
                        Salva
                      </Button>
                    </ModalFooter>
                  </>
                </>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
