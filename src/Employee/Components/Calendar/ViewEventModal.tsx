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

export default function ViewEventModal({
  isOpen,
  eventId,
  isClosed,
}: ViewEventModalProps) {
  const [newEvent, setNewEvent] = useState<CalendarEvent>(INITIAL_EVENT_DATA);
  const [modalUploadFile, setModalUploadFile] = useState({
    open: false,
  });

  async function fetchEvent() {
    if (eventId === 0) return;
    const res = await axios.get(`/Calendar/GET/GetEventByEventId`, {
      params: {
        eventId: eventId,
      },
    });
    setNewEvent(res.data);
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
  }, [eventId]);

  function handleCloseModal() {
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
    await axios.delete(`/Calendar/DELETE/DeleteEventAttachment`, {
      params: {
        EventAttachmentId: newEvent.EventAttachments[index].EventAttachmentId,
        EventAttachmentUrl: newEvent.EventAttachments[index].EventAttachmentUrl,
      },
    });
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
                        <ReactQuill
                          readOnly
                          className="sm:col-span-2 sm:mt-0 h-fit"
                          theme="bubble"
                          value={newEvent.EventDescription}
                        />
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
                                newEvent.EventAttachments.map((file, index) => (
                                  <FileCard
                                    file={file}
                                    index={index}
                                    DeleteFile={DeleteFile}
                                    key={index}
                                    variant="delete"
                                  />
                                ))}
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
                            {newEvent.EventPartecipants.map((Partecipant) => (
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
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
