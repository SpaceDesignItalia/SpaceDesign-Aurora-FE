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
import { motion, AnimatePresence } from "framer-motion";

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
      <div className="font-sans min-h-screen bg-white relative overflow-hidden">
        {/* Rimuovo gli elementi decorativi di sfondo */}
        <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              type: "spring",
              stiffness: 100,
            }}
            className="grid md:grid-cols-2 items-center gap-8 max-w-7xl w-full mx-auto"
          >
            {/* Form di login */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-xl border-2 border-white/20 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl hover:shadow-3xl transition-all duration-500 mx-auto md:mx-0"
            >
              <form
                className="space-y-6"
                onSubmit={handleLogin}
                autoComplete="on"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-10"
                >
                  <h3 className="text-3xl font-semibold text-primary">
                    Accedi
                  </h3>
                  <p className="text-small text-default-600 mt-4">
                    Accedi per continuare e scoprire tutte le funzionalità a tua
                    disposizione. Il tuo viaggio inizia qui.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label
                    htmlFor="email"
                    className="text-sm mb-2 block font-medium text-default-700"
                  >
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <Input
                      name="username"
                      variant="bordered"
                      placeholder="Inserisci un email"
                      size="lg"
                      radius="full"
                      className="backdrop-blur-sm bg-white/50"
                      endContent={
                        <EmailIcon className="text-2xl text-primary pointer-events-none" />
                      }
                      isInvalid={
                        alertData.isOpen && alertData.alertColor === "red"
                      }
                      onChange={handleEmailChange}
                      required
                      fullWidth
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label
                    htmlFor="password"
                    className="text-sm mb-2 block font-medium text-default-700"
                  >
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Input
                      name="password"
                      variant="bordered"
                      type={isVisible ? "text" : "password"}
                      placeholder="Inserisci la password"
                      size="lg"
                      radius="full"
                      className="backdrop-blur-sm bg-white/50"
                      endContent={
                        <button
                          className="focus:outline-none"
                          type="button"
                          onClick={toggleVisibility}
                        >
                          {isVisible ? (
                            <RemoveRedEyeIcon className="text-2xl text-primary pointer-events-none" />
                          ) : (
                            <VisibilityOffIcon className="text-2xl text-primary pointer-events-none" />
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-between gap-2"
                >
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-10"
                >
                  <Button
                    isLoading={isLogging}
                    type="submit"
                    color="primary"
                    radius="full"
                    className="w-full shadow-lg hover:shadow-xl transition-all duration-300 text-base py-6"
                  >
                    Accedi
                  </Button>
                </motion.div>
              </form>
            </motion.div>

            {/* Immagine di accompagnamento */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:h-[500px] md:h-[400px] mt-10 md:mt-0 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <img
                src="https://readymadeui.com/login-image.webp"
                className="w-full h-full object-cover"
                alt="Login visual"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
