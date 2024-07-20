import { useState, useEffect } from "react";
import { Avatar, Button, Input } from "@nextui-org/react";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import axios from "axios";
import { API_URL_IMG } from "../../../../API/API";
import StatusAlert from "../../Layout/StatusAlert";

interface Staffer {
  StafferId: number;
  StafferName: string;
  StafferSurname: string;
  StafferEmail: string;
  StafferPhone: string;
  StafferImageUrl: string;
}

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

const STAFFER_DEFAULT: Staffer = {
  StafferId: 0,
  StafferName: "",
  StafferSurname: "",
  StafferEmail: "",
  StafferPhone: "",
  StafferImageUrl: "",
};

const ALERT_DEFAULT: AlertData = {
  isOpen: false,
  alertTitle: "",
  alertDescription: "",
  alertColor: "",
};

export default function SettingsModel() {
  const [userData, setUserData] = useState<Staffer>(STAFFER_DEFAULT);
  const [userEditedData, setUserEditedData] =
    useState<Staffer>(STAFFER_DEFAULT);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [alertData, setAlertData] = useState<AlertData>(ALERT_DEFAULT);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        setUserEditedData(res.data);
        setUserData(res.data);
        setProfileImagePreview(
          API_URL_IMG + "/profileIcons/" + res.data.StafferImageUrl
        );
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserEditedData({
      ...userEditedData,
      [name]: value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setProfileImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("newEmployeeData", JSON.stringify(userEditedData));
    formData.append("oldPhoto", userData.StafferImageUrl);
    if (profileImage) {
      formData.append("file", profileImage);
    }

    try {
      setIsSaving(true);
      const res = await axios.put(
        "/Staffer/UPDATE/SettingsUpdateStaffer",
        formData,
        { withCredentials: true }
      );

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          alertTitle: "Operazione completata",
          alertDescription: "I dati sono stati aggiornati con successo.",
          alertColor: "green",
        });

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setAlertData({
        isOpen: true,
        alertTitle: "Errore durante l'operazione",
        alertDescription:
          "Si è verificato un errore durante la modifica dei dati. Per favore, riprova più tardi.",
        alertColor: "red",
      });
      console.error("Errore durante l'aggiornamento dei dati:", error);
    }
  };

  const isDataUnchanged =
    JSON.stringify(userData) === JSON.stringify(userEditedData) &&
    !profileImage;

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="border border-gray-200 sm:overflow-hidden rounded-xl">
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8 border-b-2 border-gray-200">
          <div>
            <h2 className="text-base font-semibold leading-7">
              Informazioni personali
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Modifica le tue informazioni personali.
            </p>
          </div>

          <form className="md:col-span-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
              <div className="col-span-full flex items-center gap-x-8">
                <Avatar
                  name={userData.StafferName}
                  radius="sm"
                  isBordered
                  src={profileImagePreview}
                  className="h-24 w-24"
                />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                    id="profileImage"
                  />
                  <label htmlFor="profileImage">
                    <Button as="span" color="primary" radius="sm">
                      Cambia foto profilo
                    </Button>
                  </label>
                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    JPG, GIF or PNG.
                  </p>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="StafferName"
                  className="block text-sm font-medium leading-6"
                >
                  Nome
                </label>
                <div className="mt-2">
                  <Input
                    variant="bordered"
                    value={userEditedData.StafferName}
                    onChange={handleChange}
                    radius="sm"
                    id="StafferName"
                    name="StafferName"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="StafferSurname"
                  className="block text-sm font-medium leading-6"
                >
                  Cognome
                </label>
                <div className="mt-2">
                  <Input
                    variant="bordered"
                    value={userEditedData.StafferSurname}
                    onChange={handleChange}
                    radius="sm"
                    id="StafferSurname"
                    name="StafferSurname"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="StafferPhone"
                  className="block text-sm font-medium leading-6"
                >
                  Numero di telefono
                </label>
                <div className="mt-2">
                  <Input
                    variant="bordered"
                    value={userEditedData.StafferPhone}
                    onChange={handleChange}
                    radius="sm"
                    id="StafferPhone"
                    name="StafferPhone"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex">
              <Button
                color="primary"
                radius="sm"
                startContent={isSaving ? "" : <SaveRoundedIcon />}
                isDisabled={isDataUnchanged}
                isLoading={isSaving}
                onClick={handleSave}
              >
                Salva
              </Button>
            </div>
          </form>
        </div>

        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7">
              Cambia password
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Aggiorna la password del tuo account.
            </p>
          </div>

          <form className="md:col-span-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
              <div className="col-span-full">
                <label
                  htmlFor="StafferPassword"
                  className="block text-sm font-medium leading-6"
                >
                  Password attuale
                </label>
                <div className="mt-2">
                  <Input
                    variant="bordered"
                    radius="sm"
                    id="StafferPassword"
                    name="StafferPassword"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="NewPassword"
                  className="block text-sm font-medium leading-6"
                >
                  Nuova password
                </label>
                <div className="mt-2">
                  <Input
                    variant="bordered"
                    radius="sm"
                    id="NewPassword"
                    name="NewPassword"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="ConfirmNewPassword"
                  className="block text-sm font-medium leading-6"
                >
                  Conferma nuova password
                </label>
                <div className="mt-2">
                  <Input
                    variant="bordered"
                    radius="sm"
                    id="ConfirmNewPassword"
                    name="ConfirmNewPassword"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex">
              <Button
                color="primary"
                radius="sm"
                startContent={<SaveRoundedIcon />}
              >
                Salva
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
