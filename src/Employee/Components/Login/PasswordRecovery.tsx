import { useState } from "react";
import { Button, Input } from "@heroui/react";
import EmailIcon from "@mui/icons-material/Email";
import axios from "axios";
import PasswordReset from "./PasswordReset";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

type StatusType = "success" | "error" | null;

export default function PasswordRecovery() {
  const [email, setEmail] = useState<string>("");
  const [showReset, setShowReset] = useState<boolean>(false);
  const [status, setStatus] = useState<StatusType>(null);

  const handleEmailChange = (e: any) => {
    setEmail(e.target.value);
    setStatus(null);
  };

  const getBorderColor = () => {
    if (status === "error") return "border-danger-400";
    return "border-white/20";
  };

  const handlePasswordRecovery = (e: any) => {
    e.preventDefault();
    axios
      .post(
        "/Authentication/POST/PasswordRecovery",
        { email },
        { withCredentials: true }
      )
      .then((res) => {
        if (res.status === 200) {
          setShowReset(true);
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  };

  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-default-50 via-default-100 to-default-50 relative overflow-hidden">
      {/* Elementi decorativi di sfondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <AnimatePresence mode="wait">
        {showReset ? (
          <PasswordReset email={email} key="reset" />
        ) : (
          <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4 relative z-10">
            <div className="mx-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100,
                }}
                className={`bg-white/90 backdrop-blur-xl border-2 ${getBorderColor()} rounded-2xl p-8 max-w-md w-full shadow-2xl hover:shadow-3xl transition-all duration-500`}
              >
                <motion.div
                  className="flex flex-col items-center pb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    className={`w-20 h-20 ${
                      status === "error" ? "bg-danger-100" : "bg-primary/10"
                    } rounded-full flex items-center justify-center mb-6 shadow-lg transition-colors duration-300`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <EmailIcon
                      className={`${
                        status === "error" ? "text-danger-600" : "text-primary"
                      } text-3xl transition-colors duration-300`}
                    />
                  </motion.div>
                  <h2 className="text-2xl font-semibold text-primary">
                    Recupero Password
                  </h2>
                  <p className="text-small text-default-600 mt-2 text-center">
                    Inserisci la tua email per ricevere il codice di recupero
                  </p>
                  {status === "error" && (
                    <p className="text-small text-danger-600 mt-2 text-center">
                      Si è verificato un errore. Riprova.
                    </p>
                  )}
                </motion.div>

                <form
                  className="flex flex-col gap-4"
                  onSubmit={handlePasswordRecovery}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Input
                      isRequired
                      label="Indirizzo Email"
                      radius="full"
                      name="email"
                      placeholder="Inserisci la tua email"
                      type="email"
                      variant="bordered"
                      className="backdrop-blur-sm bg-white/50"
                      endContent={
                        <EmailIcon className="text-2xl text-primary pointer-events-none" />
                      }
                      onChange={handleEmailChange}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      type="submit"
                      color="primary"
                      className="w-full mt-4"
                      radius="full"
                    >
                      Invia Codice di Reset
                    </Button>
                  </motion.div>
                </form>

                <motion.div
                  className="text-center mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link to="/login" className="w-full">
                    <Button
                      variant="light"
                      className="text-primary w-full"
                      radius="full"
                    >
                      Torna al Login
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
