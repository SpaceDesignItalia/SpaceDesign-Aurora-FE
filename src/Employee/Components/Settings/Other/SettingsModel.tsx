import { useState, useEffect } from "react";
import { Avatar, Button, Input } from "@heroui/react";
import axios from "axios";
import { API_URL_IMG } from "../../../../API/API";
import StatusAlert from "../../Layout/StatusAlert";
import { Icon } from "@iconify/react";
interface Staffer {
  StafferId: number;
  StafferName: string;
  StafferSurname: string;
  StafferEmail: string;
  StafferPhone: string;
  StafferImageUrl: string;
}

interface ChangePassword {
  OldPassword: string;
  NewPassword: string;
  ConfirmPassword: string;
}

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

const STAFFER_DEFAULT: Staffer = {
  StafferId: 0,
  StafferName: "",
  StafferSurname: "",
  StafferEmail: "",
  StafferPhone: "",
  StafferImageUrl: "",
};

const CHANGEPASSWORD_DEFAULT: ChangePassword = {
  OldPassword: "",
  NewPassword: "",
  ConfirmPassword: "",
};

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

const phoneRegex = /^[0-9]{1,10}$/;

export default function SettingsModel() {
  const [userData, setUserData] = useState<Staffer>(STAFFER_DEFAULT);
  const [userEditedData, setUserEditedData] =
    useState<Staffer>(STAFFER_DEFAULT);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [changePassword, setChangePassword] = useState<ChangePassword>(
    CHANGEPASSWORD_DEFAULT
  );
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSavingNewPassword, setIsSavingNewPassword] =
    useState<boolean>(false);
  const [errors, setErrors] = useState({
    phone: "",
  });

  useEffect(() => {
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then((res) => {
        setUserEditedData(res.data);
        setUserData(res.data);
        setProfileImagePreview(
          API_URL_IMG + "/profileIcons/" + res.data.StafferImageUrl
        );
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "StafferPhone") {
      if (value.length > 10) {
        return; // Limita l'input a 10 cifre
      }
      validatePhone(value);
    }
    setUserEditedData({
      ...userEditedData,
      [name]: value,
    });
  };

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChangePassword({
      ...changePassword,
      [name]: value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setProfileImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const validatePhone = (phone: string) => {
    if (!phoneRegex.test(phone)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phone: "Numero di telefono non valido",
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phone: "",
      }));
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
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
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
        onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
        alertColor: "red",
      });
      console.error("Errore durante l'aggiornamento dei dati:", error);
    }
  };

  const handleSavePassword = async () => {
    try {
      setIsSavingNewPassword(true);
      const res = await axios.put(
        "/Staffer/UPDATE/UpdateStafferPassword",
        {
          ChangePasswordData: changePassword,
        },
        { withCredentials: true }
      );

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          alertTitle: "Operazione completata",
          alertDescription: "La password è stata cambiata con successo.",
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertColor: "green",
        });

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error: any) {
      if (error.response.status === 401) {
        setAlertData({
          isOpen: true,
          alertTitle: "Errore durante l'operazione",
          alertDescription: "La password attuale è errata!",
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertColor: "red",
        });
      } else {
        setAlertData({
          isOpen: true,
          alertTitle: "Errore durante l'operazione",
          alertDescription:
            "Si è verificato un errore durante la modifica dei dati. Per favore, riprova più tardi.",
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertColor: "red",
        });
        console.error("Errore durante l'aggiornamento dei dati:", error);
      }
    }
  };

  const isDataUnchanged =
    JSON.stringify(userData) === JSON.stringify(userEditedData) &&
    !profileImage;

  const isPasswordFieldsNotEmpty = () => {
    if (
      changePassword.OldPassword !== "" &&
      changePassword.NewPassword !== "" &&
      changePassword.ConfirmPassword !== "" &&
      changePassword.NewPassword == changePassword.ConfirmPassword &&
      changePassword.OldPassword !== changePassword.NewPassword
    ) {
      return false;
    }
    return true;
  };
  return (
    <>
      <StatusAlert AlertData={alertData} />

      <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8 border-b-2 border-gray-200">
        <div>
          <h2 className="text-base font-medium leading-7">
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
                  <Button as="span" color="primary" radius="full">
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
                  radius="full"
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
                  radius="full"
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
                  radius="full"
                  id="StafferPhone"
                  name="StafferPhone"
                  isInvalid={errors.phone != ""}
                  errorMessage={errors.phone}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex">
            <Button
              color="primary"
              radius="sm"
              startContent={
                !isSaving && <Icon icon="basil:save-outline" fontSize={22} />
              }
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
          <h2 className="text-base font-medium leading-7">Cambia password</h2>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            Aggiorna la password del tuo account.
          </p>
        </div>

        <form className="md:col-span-2">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
            <div className="col-span-full">
              <label
                htmlFor="OldPassword"
                className="block text-sm font-medium leading-6"
              >
                Password attuale
              </label>
              <div className="mt-2">
                <Input
                  type="password"
                  variant="bordered"
                  radius="full"
                  id="OldPassword"
                  name="OldPassword"
                  onChange={handleChangePassword}
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
                  type="password"
                  variant="bordered"
                  radius="full"
                  id="NewPassword"
                  name="NewPassword"
                  onChange={handleChangePassword}
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="ConfirmPassword"
                className="block text-sm font-medium leading-6"
              >
                Conferma nuova password
              </label>
              <div className="mt-2">
                <Input
                  type="password"
                  variant="bordered"
                  radius="full"
                  id="ConfirmPassword"
                  name="ConfirmPassword"
                  onChange={handleChangePassword}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex">
            <Button
              color="primary"
              radius="full"
              startContent={
                !isSavingNewPassword && (
                  <Icon icon="basil:save-outline" fontSize={22} />
                )
              }
              isDisabled={isPasswordFieldsNotEmpty()}
              isLoading={isSavingNewPassword}
              onClick={handleSavePassword}
            >
              Salva
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
