import { useState } from "react";
import { useEffect } from "react";
import { Button, Input, InputOtp } from "@heroui/react";
import axios from "axios";
import LockResetIcon from "@mui/icons-material/LockReset";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { motion, AnimatePresence } from "framer-motion";

type StatusType = "success" | "error" | null;
type StepType = "otp" | "password" | "success";

export default function PasswordReset({ email }: { email: string }) {
  const [code, setCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [step, setStep] = useState<StepType>("otp");
  const [status, setStatus] = useState<StatusType>(null);
  const [countdown, setCountdown] = useState(5);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (resendTimer > 0 && !canResend) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (resendTimer === 0 && !canResend) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  const handleCodeChange = (value: string) => {
    setCode(value);
    setStatus(null);
  };

  const handlePasswordChange = (e: any) => {
    setNewPassword(e.target.value);
    setStatus(null);
  };

  const handleConfirmPasswordChange = (e: any) => {
    setConfirmPassword(e.target.value);
    setStatus(null);
  };

  const handleResendCode = async () => {
    try {
      const res = await axios.post(
        "/Authentication/POST/PasswordRecovery",
        { email },
        { withCredentials: true }
      );
      if (res.status === 200) {
        setCode("");
        setCanResend(false);
        setResendTimer(30);
        setStatus("success");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setStatus("error");
      return;
    }

    setStatus(null);
    try {
      const res = await axios.post(
        "/Authentication/POST/VerifyOtp",
        {
          email,
          code,
        },
        { withCredentials: true }
      );

      if (res.data.valid || res.status === 200) {
        setStatus("success");
        setStep("password");
      } else {
        console.error("Errore verifica OTP:", res.data.error);
        setStatus("error");
      }
    } catch (error) {
      console.error("Errore durante la verifica OTP:", error);
      setStatus("error");
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setStatus("error");
      return;
    }

    setStatus(null);
    try {
      const res = await axios.put(
        "/Authentication/UPDATE/ResetPassword",
        { email, code, newPassword },
        { withCredentials: true }
      );
      if (res.status === 200) {
        setStatus("success");
        setStep("success");
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              window.location.href = "/login";
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const getBorderColor = () => {
    if (step === "success") return "border-success-400";
    if (status === "error") return "border-danger-400";
    return "border-white/20";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4 relative z-10">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={containerVariants}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 100,
        }}
        className={`bg-white/90 backdrop-blur-xl border-2 ${getBorderColor()} rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl hover:shadow-3xl transition-all duration-500`}
      >
        <AnimatePresence mode="wait">
          {step === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mb-4"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360, 360],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              >
                <CheckCircleIcon className="text-success-600 text-4xl" />
              </motion.div>
              <h2 className="text-2xl font-semibold text-success-600 mb-4">
                Password Reimpostata con Successo!
              </h2>
              <p className="text-default-600">
                Sarai reindirizzato alla pagina di login tra {countdown}{" "}
                secondi...
              </p>
            </motion.div>
          ) : step === "otp" ? (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className={`w-20 h-20 ${
                  status === "error" ? "bg-danger-100" : "bg-primary/10"
                } rounded-full flex items-center justify-center mb-4 shadow-lg transition-colors duration-300`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LockResetIcon
                  className={`${
                    status === "error" ? "text-danger-600" : "text-primary"
                  } text-6xl transition-colors duration-300`}
                />
              </motion.div>
              <h2 className="text-2xl font-semibold text-primary">
                Verifica Codice
              </h2>
              <p className="text-small text-default-600 mt-2 text-center mb-8">
                Inserisci il codice di verifica ricevuto via email
              </p>
              {status === "error" && (
                <p className="text-small text-danger-600 mt-2 text-center mb-4">
                  Codice non valido. Riprova.
                </p>
              )}

              <form className="w-full flex flex-col gap-6" onSubmit={verifyOtp}>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-center">
                    <InputOtp
                      length={6}
                      radius="full"
                      size="lg"
                      value={code}
                      onValueChange={handleCodeChange}
                      classNames={{
                        input: `w-11 h-11 text-lg bg-white/50 backdrop-blur-sm border-2 ${
                          status === "error"
                            ? "border-danger-400 hover:border-danger-500 focus:border-danger-500"
                            : "hover:border-primary focus:border-primary"
                        } transition-colors`,
                        segmentWrapper: "gap-2",
                      }}
                    />
                  </div>
                  <div className="flex justify-center mt-2">
                    {canResend ? (
                      <Button
                        variant="light"
                        onClick={handleResendCode}
                        className="text-primary"
                        radius="full"
                      >
                        Rinvia Codice
                      </Button>
                    ) : (
                      <p className="text-small text-default-500">
                        Sarà possibile rinviare il codice tra {resendTimer}{" "}
                        secondi
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  color={status === "error" ? "danger" : "primary"}
                  radius="full"
                  className="w-full shadow-lg hover:shadow-xl transition-all duration-300 text-base py-6"
                  isDisabled={code.length !== 6}
                >
                  Verifica Codice
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className={`w-24 h-24 ${
                  status === "error" ? "bg-danger-100" : "bg-success-100"
                } rounded-full flex items-center justify-center mb-4 shadow-lg transition-colors duration-300`}
                initial={{ scale: 0.8, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                {status === "error" ? (
                  <ErrorIcon className="text-danger-600 text-4xl" />
                ) : (
                  <CheckCircleIcon className="text-success-600 text-4xl" />
                )}
              </motion.div>
              <h2 className="text-2xl font-semibold text-primary">
                Nuova Password
              </h2>
              <p className="text-small text-default-600 mt-2 text-center mb-8">
                {status === "error"
                  ? "Si è verificato un errore. Riprova."
                  : "Codice verificato con successo. Inserisci la nuova password"}
              </p>

              <form
                className="w-full flex flex-col gap-6"
                onSubmit={handlePasswordReset}
              >
                <Input
                  isRequired
                  label="Nuova Password"
                  name="newPassword"
                  type="password"
                  placeholder="Inserisci la nuova password"
                  variant="bordered"
                  radius="full"
                  className="backdrop-blur-sm bg-white/50"
                  classNames={{
                    input: "rounded-full",
                    inputWrapper: `rounded-full ${
                      status === "error" ? "border-danger-400" : ""
                    }`,
                    label: "font-medium text-default-700",
                  }}
                  onChange={handlePasswordChange}
                />

                <Input
                  isRequired
                  label="Conferma Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Conferma la nuova password"
                  variant="bordered"
                  radius="full"
                  className="backdrop-blur-sm bg-white/50"
                  classNames={{
                    input: "rounded-full",
                    inputWrapper: `rounded-full ${
                      status === "error" || newPassword !== confirmPassword
                        ? "border-danger-400"
                        : ""
                    }`,
                    label: "font-medium text-default-700",
                  }}
                  onChange={handleConfirmPasswordChange}
                />

                {newPassword !== confirmPassword && confirmPassword !== "" && (
                  <p className="text-small text-danger-600 text-center">
                    Le password non coincidono
                  </p>
                )}

                <Button
                  type="submit"
                  color={status === "error" ? "danger" : "primary"}
                  radius="full"
                  className="w-full shadow-lg hover:shadow-xl transition-all duration-300 text-base py-6"
                  isDisabled={
                    newPassword.length < 8 || newPassword !== confirmPassword
                  }
                >
                  Reimposta Password
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
