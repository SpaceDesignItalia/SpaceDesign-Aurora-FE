import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import AccessAlarmsRoundedIcon from "@mui/icons-material/AccessAlarmsRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import dayjs from "dayjs";

export default function UpcomingEventsCard() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const events = [
    {
      id: 1,
      title: "Conferenza Tech",
      date: "2025-01-20",
      time: "14:00",
      location: "Sala Conferenze, Milano",
      description: "Conferenza sulle ultime novità tecnologiche.",
    },
    {
      id: 2,
      title: "Workshop di Design",
      date: "2025-01-19",
      time: "10:00 - 12:00",
      location: "Piattaforma Zoom",
      description: "Workshop sul design e branding.",
    },
    {
      id: 3,
      title: "Networking Event",
      date: "2025-01-22",
      time: "18:00 - 20:00",
      location: "Caffè Centrale, Torino",
      description: "Evento di networking per professionisti.",
    },
    {
      id: 4,
      title: "Presentazione prodotto",
      date: "2025-01-25",
      time: "09:30",
      location: "Online su Microsoft Teams",
      description: "Presentazione del nuovo prodotto aziendale",
    },
  ];

  const sortedEvents = events
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="border-2 h-full rounded-xl p-4 md:p-5 bg-white">
      <h1 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
        Eventi in programma
      </h1>
      <div className="space-y-4">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => (
            <div
              key={event.id}
              className="cursor-default flex flex-row justify-between gap-3 lg:flex-row items-center border px-5 py-3 rounded-lg  bg-gray-50"
            >
              <div className="flex flex-col gap-2 text-center lg:text-left">
                <h2 className="text-sm sm:text-md font-medium text-gray-800 ">
                  {event.title}
                </h2>
                <p className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <AccessAlarmsRoundedIcon className="text-primary" />
                  {event.time} | {dayjs(event.date).format("DD MMMM YYYY")}
                </p>
                <p className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 italic">
                  <PlaceRoundedIcon className="text-primary" />
                  {event.location}
                </p>
              </div>
              <Button
                color="primary"
                radius="full"
                onPress={onOpen}
                className="px-4 py-2 text-sm"
              >
                Dettagli
              </Button>
              <Modal isOpen={isOpen} onOpenChange={onOpenChange} radius="lg">
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        {event.title}
                      </ModalHeader>
                      <ModalBody>
                        <div className="text-gray-700">
                          <p className="flex items-center gap-2 text-sm">
                            <AccessAlarmsRoundedIcon className="text-primary" />
                            {event.time}
                          </p>
                          <p className="flex items-center gap-2 text-sm italic">
                            <PlaceRoundedIcon className="text-primary" />
                            {event.location}
                          </p>
                          <p className="mt-3 text-sm">{event.description}</p>
                        </div>
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          color="danger"
                          variant="light"
                          radius="full"
                          onPress={onClose}
                          className="text-sm"
                        >
                          Chiudi
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <EventBusyRoundedIcon className="text-4xl mb-2" />
            <p>Nessun evento in programma.</p>
          </div>
        )}
      </div>
    </div>
  );
}
