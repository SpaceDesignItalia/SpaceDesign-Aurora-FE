import { useState, useEffect } from "react";
import { Avatar, Button, Input } from "@heroui/react";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import axios from "axios";
import { API_URL_IMG } from "../../../../API/API";
import StatusAlert from "../../Layout/StatusAlert";

interface Customer {
  CustomerId: number;
  CustomerName: string;
  CustomerSurname: string;
  CustomerEmail: string;
  CustomerPhone: string;
  CustomerImageUrl: string;
}

interface ChangePassword {
  OldPassword: string;
  NewPassword: string;
  ConfirmPassword: string;
}

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

const CUSTOMER_DEFAULT: Customer = {
  CustomerId: 0,
  CustomerName: "",
  CustomerSurname: "",
  CustomerEmail: "",
  CustomerPhone: "",
  CustomerImageUrl: "",
};

const CHANGEPASSWORD_DEFAULT: ChangePassword = {
  OldPassword: "",
  NewPassword: "",
  ConfirmPassword: "",
};

const ALERT_DEFAULT: AlertData = {
  isOpen: false,
  alertTitle: "",
  alertDescription: "",
  alertColor: "",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{1,10}$/;

export default function SettingsModel() {
  const [userData, setUserData] = useState<Customer>(CUSTOMER_DEFAULT);
  const [userEditedData, setUserEditedData] =
    useState<Customer>(CUSTOMER_DEFAULT);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [changePassword, setChangePassword] = useState<ChangePassword>(
    CHANGEPASSWORD_DEFAULT
  );
  const [alertData, setAlertData] = useState<AlertData>(ALERT_DEFAULT);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSavingNewPassword, setIsSavingNewPassword] =
    useState<boolean>(false);
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  });

  useEffect(() => {
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then((res) => {
        setUserEditedData(res.data);
        setUserData(res.data);
        setProfileImagePreview(
          API_URL_IMG + "/profileIcons/" + res.data.CustomerImageUrl
        );
      });
  }, []);

  const validateEmail = (email: string) => {
    if (!emailRegex.test(email)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: "Email non valida",
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: "",
      }));
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "CustomerEmail") {
      validateEmail(value);
    } else if (name === "CustomerPhone") {
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

  const handleSave = async () => {
    if (errors.email || errors.phone) {
      setAlertData({
        isOpen: true,
        alertTitle: "Errore durante l'operazione",
        alertDescription: "Correggi gli errori nei campi prima di salvare.",
        alertColor: "red",
      });
      return;
    }

    const formData = new FormData();
    formData.append("newCustomerData", JSON.stringify(userEditedData));
    formData.append("oldPhoto", userData.CustomerImageUrl);
    if (profileImage) {
      formData.append("file", profileImage);
    }

    try {
      setIsSaving(true);
      const res = await axios.put(
        "/Customer/UPDATE/SettingsUpdateCustomerData",
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

  const handleSavePassword = async () => {
    try {
      setIsSavingNewPassword(true);
      const res = await axios.put(
        "/Customer/UPDATE/UpdateCustomerPassword",
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
          alertColor: "red",
        });

        setTimeout(() => {
          setAlertData(ALERT_DEFAULT);
          setIsSavingNewPassword(false);
        }, 2000);
      } else {
        setAlertData({
          isOpen: true,
          alertTitle: "Errore durante l'operazione",
          alertDescription:
            "Si è verificato un errore durante la modifica dei dati. Per favore, riprova più tardi.",
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
      <div className="border border-gray-200 sm:overflow-hidden rounded-xl">
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
                  name={userData.CustomerName}
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
                  htmlFor="CustomerName"
                  className="block text-sm font-medium leading-6"
                >
                  Nome
                </label>
                <div className="mt-2">
                  <Input
                    variant="bordered"
                    value={userEditedData.CustomerName}
                    onChange={handleChange}
                    radius="sm"
                    id="CustomerName"
                    name="CustomerName"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="CustomerSurname"
                  className="block text-sm font-medium leading-6"
                >
                  Cognome
                </label>
                <div className="mt-2">
                  <Input
                    variant="bordered"
                    value={userEditedData.CustomerSurname}
                    onChange={handleChange}
                    radius="sm"
                    id="CustomerSurname"
                    name="CustomerSurname"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="CustomerEmail"
                  className="block text-sm font-medium leading-6"
                >
                  Email
                </label>
                <div className="mt-2">
                  <Input
                    variant="bordered"
                    value={userEditedData.CustomerEmail}
                    onChange={handleChange}
                    radius="sm"
                    id="CustomerEmail"
                    name="CustomerEmail"
                    isInvalid={errors.email != ""}
                    errorMessage={errors.email}
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="CustomerPhone"
                  className="block text-sm font-medium leading-6"
                >
                  Numero di telefono
                </label>
                <div className="mt-2">
                  <Input
                    variant="bordered"
                    value={userEditedData.CustomerPhone}
                    onChange={handleChange}
                    radius="sm"
                    id="CustomerPhone"
                    name="CustomerPhone"
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
                startContent={!isSaving && <SaveRoundedIcon />}
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
                    radius="sm"
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
                    radius="sm"
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
                    radius="sm"
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
                radius="sm"
                startContent={!isSavingNewPassword && <SaveRoundedIcon />}
                isDisabled={isPasswordFieldsNotEmpty()}
                isLoading={isSavingNewPassword}
                onClick={handleSavePassword}
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
