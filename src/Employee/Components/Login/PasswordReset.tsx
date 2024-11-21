import { useState } from "react";
import { Button, Input } from "@nextui-org/react";
import axios from "axios";

export default function PasswordReset({ email }: { email: string }) {
  // Accept email as a prop
  const [code, setCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleCodeChange = (e: any) => {
    setCode(e.target.value);
  };

  const handlePasswordChange = (e: any) => {
    setNewPassword(e.target.value);
  };

  const handlePasswordReset = (e: any) => {
    e.preventDefault();
    axios
      .put(
        "/Authentication/UPDATE/ResetPassword",
        { email, code, newPassword }, // Send email along with the code and new password
        { withCredentials: true }
      )
      .then((res) => {
        if (res.status === 200) {
          setMessage("Password successfully reset. Redirecting to login...");
          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
        } else {
          setMessage("Failed to reset password. Please try again.");
        }
      })
      .catch(() => {
        setMessage("An error occurred. Please try again.");
      });
  };

  return (
    <div className="font-sans text-gray-800">
      <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
        <div className="border border-gray-300 rounded-md p-6 max-w-md shadow-lg">
          <form className="space-y-6" onSubmit={handlePasswordReset}>
            <div className="mb-10">
              <h3 className="text-3xl font-bold">Reset Password</h3>
              <p className="text-sm mt-4">
                Enter the code sent to your email and your new password.
              </p>
            </div>
            <div>
              <label htmlFor="code" className="text-sm mb-2 block">
                Recovery Code
              </label>
              <div className="relative flex items-center">
                <Input
                  name="code"
                  variant="bordered"
                  placeholder="Enter your recovery code"
                  size="lg"
                  radius="sm"
                  onChange={handleCodeChange}
                  isRequired
                  fullWidth
                />
              </div>
            </div>
            <div>
              <label htmlFor="newPassword" className="text-sm mb-2 block">
                New Password
              </label>
              <div className="relative flex items-center">
                <Input
                  name="newPassword"
                  variant="bordered"
                  type="password"
                  placeholder="Enter your new password"
                  size="lg"
                  radius="sm"
                  onChange={handlePasswordChange}
                  isRequired
                  fullWidth
                />
              </div>
            </div>
            <div className="mt-10">
              <Button type="submit" color="primary" radius="sm" fullWidth>
                Reset Password
              </Button>
            </div>
            {message && (
              <div className="mt-4 text-sm text-gray-600">{message}</div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
