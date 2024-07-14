import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Textarea,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import SaveIcon from "@mui/icons-material/Save";
import StatusAlert from "../../Layout/StatusAlert";
import { useParams } from "react-router-dom";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";

interface Ticket {
  TicketRequestTypeId: number;
  TicketRequestName: string;
}

interface userData {
  CustomerId: number;
  CustomerName: string;
  CustomerSurname: string;
  CustomerEmail: string;
  CustomerPhone: string | null;
}

interface NewTicket {
  ProjectTicketTitle: string;
  ProjectTicketDescription: string;
  ProjectId: number;
  CustomerId: number;
  TicketRequestTypeId: number;
}

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

const USERDATA_VALUE: userData = {
  CustomerId: 0,
  CustomerName: "",
  CustomerSurname: "",
  CustomerEmail: "",
  CustomerPhone: null,
};

const TICKET_DEFAULT: NewTicket = {
  ProjectTicketTitle: "",
  ProjectTicketDescription: "",
  ProjectId: 0,
  CustomerId: 0,
  TicketRequestTypeId: 0,
};

const ALERTDATA: AlertData = {
  isOpen: false,
  alertTitle: "",
  alertDescription: "",
  alertColor: "",
};

export default function AddTicketModal() {
  const { ProjectId } = useParams();
  const [ticket, setTicket] = useState<NewTicket>(TICKET_DEFAULT);
  const [userData, setUserData] = useState<userData>(USERDATA_VALUE);
  const [ticketType, setTicketType] = useState<Ticket[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>(ALERTDATA);

  useEffect(() => {
    axios.get("/Ticket/GET/GetAllTicketTypes").then((res) => {
      setTicketType(res.data);
    });

    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then((res) => {
        setUserData(res.data);
      });
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue =
      name === "CustomerPhone"
        ? value.replace(/\D/g, "").slice(0, 15) || null
        : value.slice(0, 150);
    setTicket((prevData) => ({ ...prevData, [name]: newValue }));
  };

  const handleTicketTypeIdChange = (key: string | number | null) => {
    if (key !== null) {
      setTicket((prevData) => ({
        ...prevData,
        TicketRequestTypeId: Number(key),
      }));
    } else {
      setTicket((prevData) => ({
        ...prevData,
        TicketRequestTypeId: 0,
      }));
    }
  };

  const handleUpdateCustomer = async () => {
    try {
      setIsSaving(true);
      const res = await axios.post("/Ticket/POST/OpenNewTicket", {
        TicketData: {
          ...ticket,
          ProjectId: ProjectId,
          CustomerId: userData.CustomerId,
        },
      });

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          alertTitle: "Operazione completata",
          alertDescription: "Il ticket è stato aperto con successo.",
          alertColor: "green",
        });
        setTimeout(() => {
          window.location.href = "/projects";
        }, 2000);
      }
    } catch (error) {
      setAlertData({
        isOpen: true,
        alertTitle: "Errore durante l'operazione",
        alertDescription:
          "Si è verificato un errore durante l'apertura del ticket. Per favore, riprova più tardi.",
        alertColor: "red",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const checkAllDataCompiled = () => {
    return !(
      ticket.ProjectTicketTitle !== "" &&
      ticket.ProjectTicketDescription !== "" &&
      ticket.TicketRequestTypeId !== 0
    );
  };

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <form>
          <div className="border border-gray-200 sm:overflow-hidden rounded-xl">
            <div className="space-y-6 bg-white px-4 py-6 sm:p-6">
              <div>
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Apri ticket
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Apri un nuovo ticket per questo progetto.
                </p>

                <div className="rounded-md bg-yellow-50 p-4 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ReportProblemRoundedIcon
                        aria-hidden="true"
                        className="h-5 w-5 text-yellow-400"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Attenzione
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Una volta creato il ticket non potrà più essere
                          modificato!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-6">
                  <label
                    htmlFor="ProjectTicketTitle"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Titolo ticket{" "}
                    <span className="text-red-600 font-bold">*</span>
                  </label>
                  <Input
                    variant="bordered"
                    type="text"
                    radius="sm"
                    name="ProjectTicketTitle"
                    placeholder="Inserisci il titolo del ticket"
                    onChange={handleChange}
                    aria-label="Nome"
                    fullWidth
                  />
                </div>
                <div className="col-span-6 sm:col-span-6">
                  <label
                    htmlFor="ProjectTicketDescription"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Descrizione ticket{" "}
                    <span className="text-red-600 font-bold">*</span>
                  </label>
                  <Textarea
                    variant="bordered"
                    type="text"
                    radius="sm"
                    name="ProjectTicketDescription"
                    placeholder="Inserisci la descrizione del ticket"
                    onChange={handleChange}
                    aria-label="Nome"
                    fullWidth
                  />
                </div>
                <div className="col-span-6 sm:col-span-6">
                  <label
                    htmlFor="TicketRequestTypeId"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Tipo di ticket{" "}
                    <span className="text-red-600 font-bold">*</span>
                  </label>
                  <Autocomplete
                    defaultItems={ticketType}
                    placeholder="Seleziona la tipologia di ticket"
                    onSelectionChange={handleTicketTypeIdChange}
                    variant="bordered"
                    radius="sm"
                    aria-label="company"
                    fullWidth
                  >
                    {(type) => (
                      <AutocompleteItem key={type.TicketRequestTypeId}>
                        {type.TicketRequestName}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
              <Button
                color="success"
                className="text-white"
                radius="sm"
                startContent={<SaveIcon />}
                isDisabled={checkAllDataCompiled()}
                isLoading={isSaving}
                onClick={handleUpdateCustomer}
              >
                {isSaving ? "Aprendo il ticket..." : "Apri ticket"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
