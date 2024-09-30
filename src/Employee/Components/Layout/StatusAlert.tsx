import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { motion, AnimatePresence } from "framer-motion";

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

export default function StatusAlert({ AlertData }: { AlertData: AlertData }) {
  return (
    <AnimatePresence>
      {AlertData.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`absolute top-20 right-5 w-1/4 rounded-md bg-${AlertData.alertColor}-50 p-4`}
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
              <div className={`mt-2 text-sm text-${AlertData.alertColor}-700`}>
                <p>{AlertData.alertDescription}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
