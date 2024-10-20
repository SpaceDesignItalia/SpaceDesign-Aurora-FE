import { useState } from "react";
import { Button, Input, Checkbox } from "@nextui-org/react";
import EmailIcon from "@mui/icons-material/Email";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import { Link } from "react-router-dom"; // Assuming you're using React Router
import StatusAlert from "../../Components/Layout/StatusAlert";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../API/API";

const socket = io(API_WEBSOCKET_URL);

interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

export default function Login() {
  const [isLogging, setIsLogging] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [alertData, setAlertData] = useState<AlertData>({
    isOpen: false,
    alertTitle: "",
    alertDescription: "",
    alertColor: "red",
  });

  const toggleVisibility = () => setIsVisible(!isVisible);

  function handleEmailChange(e: any) {
    const email = e.target.value;
    setLoginData({ ...loginData, email: email });
  }

  function handlePasswordChange(e: any) {
    const password = e.target.value;
    setLoginData({ ...loginData, password: password });
  }

  async function handleLogin(e: any) {
    try {
      e.preventDefault();
      setIsLogging(true);
      const res = await axios.post(
        "/Authentication/POST/Login",
        {
          LoginData: loginData,
        },
        { withCredentials: true }
      );
      if (res.status == 200) {
        axios
          .get("/Authentication/GET/GetSessionData", { withCredentials: true })
          .then(async (res) => {
            socket.emit("new-user-add", res.data.StafferId);
            window.location.href = "/";
          });
      }
    } catch (error) {
      console.error(error);
      setAlertData({
        isOpen: true,
        alertTitle: "Errore durante il login",
        alertDescription: "Email o password non validi.",
        alertColor: "red",
      });
      setIsLogging(false);
    }
  }

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="font-sans text-gray-800">
        <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
          <div className="grid md:grid-cols-2 items-center gap-4 max-w-7xl w-full">
            <div className="border border-gray-300 rounded-md p-6 max-w-md shadow-lg mx-auto md:mx-0">
              <form className="space-y-6" onSubmit={handleLogin}>
                <div className="mb-10">
                  <h3 className="text-3xl font-bold">Accedi</h3>
                  <p className="text-sm mt-4">
                    Accedi per continuare e scoprire tutte le funzionalità a tua
                    disposizione. Il tuo viaggio inizia qui
                  </p>
                </div>
                <div>
                  <label htmlFor="email" className="text-sm mb-2 block">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <Input
                      name="email"
                      variant="bordered"
                      placeholder="Inserisci un email"
                      size="lg"
                      radius="sm"
                      endContent={
                        <EmailIcon className="text-2xl text-default-400 pointer-events-none" />
                      }
                      isInvalid={
                        alertData.isOpen && alertData.alertColor == "red"
                      }
                      onChange={handleEmailChange}
                      isRequired
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
                        alertData.isOpen && alertData.alertColor == "red"
                      }
                      onChange={handlePasswordChange}
                      isRequired
                      fullWidth
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center">
                    <Checkbox
                      isSelected={loginData.rememberMe}
                      radius="sm"
                      onValueChange={() =>
                        setLoginData({
                          ...loginData,
                          rememberMe: !loginData.rememberMe,
                        })
                      }
                    >
                      Ricordami
                    </Checkbox>
                  </div>
                  <div className="text-sm">
                    <Link
                      to="/password-recovery"
                      className="text-blue-600 hover:underline"
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
