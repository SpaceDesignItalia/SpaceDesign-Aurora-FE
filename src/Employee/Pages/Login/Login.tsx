import { useState } from "react";
import { Button, Input, Checkbox } from "@heroui/react";
import EmailIcon from "@mui/icons-material/Email";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import axios from "axios";
import { Link } from "react-router-dom";
import StatusAlert from "../../Components/Layout/StatusAlert";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../API/API";
import { motion } from "framer-motion";

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
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });

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

  // Validazione email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "L'email è richiesta";
    } else if (!emailRegex.test(email)) {
      return "Inserisci un indirizzo email valido";
    }
    return "";
  };

  // Validazione input durante la digitazione
  const handleEmailBlur = () => {
    setFormErrors((prev) => ({
      ...prev,
      email: validateEmail(loginData.email),
    }));
  };

  const handlePasswordBlur = () => {
    setFormErrors((prev) => ({
      ...prev,
      password: loginData.password ? "" : "La password è richiesta",
    }));
  };

  // Effettua la richiesta di login e gestisce la risposta
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validazione prima dell'invio
    const emailError = validateEmail(loginData.email);
    const passwordError = loginData.password ? "" : "La password è richiesta";

    setFormErrors({
      email: emailError,
      password: passwordError,
    });

    if (emailError || passwordError) {
      return; // Non procedere se ci sono errori
    }

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
      <div className="font-sans min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
        {/* Elementi decorativi di sfondo */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300/10 rounded-full filter blur-3xl opacity-50 translate-x-1/3 translate-y-1/3"></div>
        </div>

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
              className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-[2rem] p-8 md:p-10 max-w-md w-full shadow-xl hover:shadow-2xl transition-all duration-500 mx-auto md:mx-0"
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
                  className="mb-8"
                >
                  <h3 className="text-3xl font-bold text-primary">
                    Bentornato
                  </h3>
                  <p className="text-base text-gray-600 mt-3">
                    Accedi al tuo account per continuare
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-1"
                >
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    name="username"
                    variant="bordered"
                    placeholder="nome@azienda.com"
                    size="lg"
                    radius="lg"
                    className="backdrop-blur-sm bg-white/80 shadow-sm"
                    startContent={
                      <EmailIcon className="text-xl text-primary/70 pointer-events-none" />
                    }
                    isInvalid={
                      !!formErrors.email ||
                      (alertData.isOpen && alertData.alertColor === "red")
                    }
                    errorMessage={formErrors.email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    required
                    fullWidth
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-1"
                >
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    variant="bordered"
                    type={isVisible ? "text" : "password"}
                    placeholder="••••••••"
                    size="lg"
                    radius="lg"
                    className="backdrop-blur-sm bg-white/80 shadow-sm"
                    startContent={
                      <LockIcon className="text-xl text-primary/70 pointer-events-none" />
                    }
                    endContent={
                      <button
                        className="focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors"
                        type="button"
                        onClick={toggleVisibility}
                        aria-label={
                          isVisible ? "Nascondi password" : "Mostra password"
                        }
                      >
                        {isVisible ? (
                          <RemoveRedEyeIcon className="text-xl text-primary/70" />
                        ) : (
                          <VisibilityOffIcon className="text-xl text-primary/70" />
                        )}
                      </button>
                    }
                    isInvalid={
                      !!formErrors.password ||
                      (alertData.isOpen && alertData.alertColor === "red")
                    }
                    errorMessage={formErrors.password}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    required
                    fullWidth
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-between gap-2 pt-2"
                >
                  <div className="flex items-center">
                    <Checkbox
                      isSelected={loginData.rememberMe}
                      radius="sm"
                      color="primary"
                      onValueChange={() =>
                        setLoginData((prev) => ({
                          ...prev,
                          rememberMe: !prev.rememberMe,
                        }))
                      }
                    >
                      <span className="text-sm text-gray-700">Ricordami</span>
                    </Checkbox>
                  </div>
                  <div className="text-sm">
                    <Link
                      to="/password-recovery"
                      className="text-primary font-medium hover:text-primary-dark transition-colors"
                    >
                      Password dimenticata?
                    </Link>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-8"
                >
                  <Button
                    isLoading={isLogging}
                    type="submit"
                    color="primary"
                    radius="lg"
                    className="w-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 text-base font-medium py-6"
                    disableRipple={isLogging}
                  >
                    {isLogging ? "Accesso in corso..." : "Accedi"}
                  </Button>
                </motion.div>
              </form>
            </motion.div>

            {/* Immagine di accompagnamento */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
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
