import { useEffect, useState } from "react";
import { Alert } from "@heroui/react";

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow" | "success" | "danger" | "warning";
}

export default function StatusAlert(props: { AlertData: AlertData }) {
  const { AlertData } = props;
  const [show, setShow] = useState(false);

  const getAlertColor = (color: "green" | "red" | "yellow") => {
    switch (color) {
      case "green":
        return "success";
      case "red":
        return "danger";
      case "yellow":
        return "warning";
      default:
        return "warning";
    }
  };

  useEffect(() => {
    if (AlertData.isOpen) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        AlertData.onClose();
      }, 5000); // 5 secondi

      return () => clearTimeout(timer);
    }
  }, [AlertData.isOpen, AlertData.onClose]);

  return (
    <div
      aria-live="assertive"
      className="z-[100] pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 top-0"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {show && (
          <Alert
            color={getAlertColor(AlertData.alertColor)}
            title={AlertData.alertTitle}
            description={AlertData.alertDescription}
            onClose={() => AlertData.onClose()}
            isClosable
            className="pointer-events-auto w-96"
            variant="faded"
          />
        )}
      </div>
    </div>
  );
}
