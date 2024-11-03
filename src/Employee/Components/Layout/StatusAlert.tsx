import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/20/solid";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

export default function StatusAlert({ AlertData }: { AlertData: AlertData }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(AlertData.isOpen);
  }, [AlertData.isOpen]);

  return (
    <div
      aria-live="assertive"
      className="z-50 pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 top-16"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        <AnimatePresence>
          {show && (
            <motion.div
              className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-xl ring-2 ring-black ring-opacity-5"
              initial={{ opacity: 0, y: 20 }} // Animation starts with opacity 0 and slides up from y: 20
              animate={{ opacity: 1, y: 0 }} // Transition to fully visible
              exit={{ opacity: 0, y: 20 }} // Exit animation, sliding down and fading out
              transition={{ duration: 0.3, ease: "easeOut" }} // Smooth easing
            >
              <div className="p-4 w-96">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {AlertData.alertColor === "green" && (
                      <CheckCircleIcon
                        aria-hidden="true"
                        className={`h-6 w-6 text-${AlertData.alertColor}-400`}
                      />
                    )}
                    {AlertData.alertColor === "yellow" && (
                      <WarningRoundedIcon
                        aria-hidden="true"
                        className={`h-6 w-6 text-${AlertData.alertColor}-400`}
                      />
                    )}
                    {AlertData.alertColor === "red" && (
                      <ErrorOutlineRoundedIcon
                        aria-hidden="true"
                        className={`h-6 w-6 text-${AlertData.alertColor}-400`}
                      />
                    )}
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {AlertData.alertTitle}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {AlertData.alertDescription}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        AlertData.onClose();
                      }}
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon aria-hidden="true" className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
