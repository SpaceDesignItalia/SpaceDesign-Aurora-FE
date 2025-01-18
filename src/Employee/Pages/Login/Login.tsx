import { useState } from "react";
import { Button, Input, Checkbox } from "@heroui/react";
import EmailIcon from "@mui/icons-material/Email";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import { Link } from "react-router-dom";
import StatusAlert from "../../Components/Layout/StatusAlert";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../API/API";

// Configura la connessione WebSocket
const socket = io(API_WEBSOCKET_URL);

interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

// Dati iniziali per il login e le notifiche
const INITIAL_LOGIN_DATA: LoginData = {
  email: "",
  password: "",
  rememberMe: false,
};

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

export default function Login() {
  // Gestisce lo stato di caricamento, la visibilità della password e i dati del form
  const [isLogging, setIsLogging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loginData, setLoginData] = useState(INITIAL_LOGIN_DATA);
  const [alertData, setAlertData] = useState(INITIAL_ALERT_DATA);

  // Alterna la visibilità del campo password
  const toggleVisibility = () => setIsVisible((prev) => !prev);

  // Aggiorna il campo email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData((prev) => ({ ...prev, email: e.target.value }));
  };

  // Aggiorna il campo password
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData((prev) => ({ ...prev, password: e.target.value }));
  };

  // Effettua la richiesta di login e gestisce la risposta
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLogging(true);

    try {
      // Esegue la richiesta di autenticazione
      const res = await axios.post(
        "/Authentication/POST/Login",
        { LoginData: loginData },
        { withCredentials: true }
      );

      // Se il login è avvenuto con successo, recupera i dati di sessione
      if (res.status === 200) {
        const sessionRes = await axios.get(
          "/Authentication/GET/GetSessionData",
          { withCredentials: true }
        );

        // Aggiunge il nuovo utente alla connessione WebSocket
        socket.emit("new-user-add", sessionRes.data.StafferId);

        // Reindirizza alla homepage
        window.location.href = "/";
      }
    } catch (error) {
      // In caso di errore, mostra una notifica all'utente
      console.error(error);
      setAlertData({
        isOpen: true,
        onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
        alertTitle: "Accesso non riuscito",
        alertDescription:
          "Controlla l'email e la password inserite e riprova. Se il problema persiste, utilizza il recupero password.",
        alertColor: "red",
      });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="font-sans text-gray-800">
        <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
          <div className="grid md:grid-cols-2 items-center gap-4 max-w-7xl w-full">
            {/* Form di login */}
            <div className="border border-gray-300 rounded-md p-6 max-w-md shadow-lg mx-auto md:mx-0">
              <form
                className="space-y-6"
                onSubmit={handleLogin}
                autoComplete="on"
              >
                <div className="mb-10">
                  <h3 className="text-3xl font-bold">Accedi</h3>
                  <p className="text-sm mt-4">
                    Accedi per continuare e scoprire tutte le funzionalità a tua
                    disposizione. Il tuo viaggio inizia qui.
                  </p>
                </div>
                <div>
                  <label htmlFor="email" className="text-sm mb-2 block">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <Input
                      name="username"
                      variant="bordered"
                      placeholder="Inserisci un email"
                      size="lg"
                      radius="sm"
                      endContent={
                        <EmailIcon className="text-2xl text-default-400 pointer-events-none" />
                      }
                      isInvalid={
                        alertData.isOpen && alertData.alertColor === "red"
                      }
                      onChange={handleEmailChange}
                      required
                      fullWidth
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="text-sm mb-2 block">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Input
                      name="password"
                      variant="bordered"
                      type={isVisible ? "text" : "password"}
                      placeholder="Inserisci la password"
                      size="lg"
                      radius="sm"
                      endContent={
                        <button
                          className="focus:outline-none"
                          type="button"
                          onClick={toggleVisibility}
                        >
                          {isVisible ? (
                            <RemoveRedEyeIcon className="text-2xl text-default-400 pointer-events-none" />
                          ) : (
                            <VisibilityOffIcon className="text-2xl text-default-400 pointer-events-none" />
                          )}
                        </button>
                      }
                      isInvalid={
                        alertData.isOpen && alertData.alertColor === "red"
                      }
                      onChange={handlePasswordChange}
                      required
                      fullWidth
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  {/* Opzione "Ricordami" e link per il recupero password */}
                  <div className="flex items-center">
                    <Checkbox
                      isSelected={loginData.rememberMe}
                      radius="sm"
                      onValueChange={() =>
                        setLoginData((prev) => ({
                          ...prev,
                          rememberMe: !prev.rememberMe,
                        }))
                      }
                    >
                      Ricordami
                    </Checkbox>
                  </div>
                  <div className="text-sm">
                    <Link
                      to="/password-recovery"
                      className="text-primary hover:underline"
                    >
                      Hai dimenticato la password?
                    </Link>
                  </div>
                </div>
                <div className="mt-10">
                  <Button
                    isLoading={isLogging}
                    type="submit"
                    color="primary"
                    radius="full"
                    fullWidth
                  >
                    Accedi
                  </Button>
                </div>
              </form>
            </div>
            {/* Immagine di accompagnamento */}
            <div className="lg:h-[400px] md:h-[300px] mt-10 md:mt-0">
              <img
                src="https://readymadeui.com/login-image.webp"
                className="w-full h-full object-cover"
                alt="Login visual"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
