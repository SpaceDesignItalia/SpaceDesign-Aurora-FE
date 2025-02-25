import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";
import Backdrop from "@mui/material/Backdrop";
import { Spinner } from "@heroui/react";

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

export default function StatusAlert({ AlertData }: { AlertData: AlertData }) {
  return (
    <>
      {AlertData.isOpen && (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={AlertData.isOpen}
        >
          <Spinner size="lg" color="primary" />
          <div
            className={`absolute top-20 right-0 w-1/4 rounded-md bg-${AlertData.alertColor}-50 p-4`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {AlertData.alertColor === "green" ? (
                  <CheckCircleIcon
                    className={`h-5 w-5 text-green-400`}
                    aria-hidden="true"
                  />
                ) : (
                  <XCircleIcon
                    className={`h-5 w-5 text-red-400`}
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="ml-3">
                <h3
                  className={`text-sm font-medium text-${AlertData.alertColor}-700`}
                >
                  {AlertData.alertTitle}
                </h3>
                <div
                  className={`mt-2 text-sm text-${AlertData.alertColor}-700`}
                >
                  <p>{AlertData.alertDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </Backdrop>
      )}
    </>
  );
}
