import { useState } from "react";
import { Button, Input, Checkbox } from "@nextui-org/react";
import EmailIcon from "@mui/icons-material/Email";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import { Link } from "react-router-dom"; // Assuming you're using React Router

interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function Login() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
    rememberMe: false,
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

  function handleLogin(e: any) {
    e.preventDefault();
    axios
      .post(
        "/Authentication/POST/Login",
        { LoginData: loginData },
        { withCredentials: true }
      )
      .then((res) => {
        if (res.status === 200) {
          window.location.href = "/";
        }
      });
  }

  return (
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
                <Button type="submit" color="primary" radius="sm" fullWidth>
                  Log in
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
  );
}
