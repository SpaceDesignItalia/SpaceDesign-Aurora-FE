import { useState } from "react";
import { Button, Input } from "@heroui/react";
import EmailIcon from "@mui/icons-material/Email";
import axios from "axios";
import PasswordReset from "./PasswordReset"; // Import the PasswordReset component

export default function PasswordRecovery() {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [showReset, setShowReset] = useState<boolean>(false); // State to control the display of PasswordReset

  const handleEmailChange = (e: any) => {
    setEmail(e.target.value);
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
          setMessage("Recovery code has been sent to your email.");
          setShowReset(true); // Show the PasswordReset component
        } else {
          setMessage("Failed to send recovery code. Please try again.");
        }
      })
      .catch(() => {
        setMessage("An error occurred. Please try again.");
      });
  };

  return (
    <div className="font-sans text-gray-800">
      {showReset ? (
        <PasswordReset email={email} />
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
          <div className="border border-gray-300 rounded-md p-6 max-w-md shadow-lg">
            <form className="space-y-6" onSubmit={handlePasswordRecovery}>
              <div className="mb-10">
                <h3 className="text-3xl font-semibold">Password Recovery</h3>
                <p className="text-sm mt-4">
                  Enter your email to receive a password reset link.
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
                    placeholder="Enter your email"
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
              <div className="mt-10">
                <Button type="submit" color="primary" radius="sm" fullWidth>
                  Send Reset Link
                </Button>
              </div>
              {message && (
                <div className="mt-4 text-sm text-gray-600">{message}</div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
