"use client";
import { Alert, AlertDescription, AlertTitle } from "@/features/ui";
import { useEffect } from "react";
import { useAlert } from "./use-alert";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";

export const AlertPopup = () => {
  const { status, message, clearAlert } = useAlert();
  useEffect(() => {
    const hideAlertTimeout = setTimeout(clearAlert, 5000);
    return () => clearTimeout(hideAlertTimeout);
  }, [status, message]);
  if (!status || !message) return null;

  return (
    <Alert className="fixed top-4 right-4 max-w-[400px]" variant={status}>
      {status === "success" && <CheckCircleIcon className="h-5 w-5" />}
      {(status === "error" || status === "info") && (
        <ExclamationCircleIcon className="h-5 w-5" />
      )}
      {status === "warning" && <ExclamationTriangleIcon className="h-5 w-5" />}
      {status && (
        <AlertTitle>{status[0].toUpperCase() + status.slice(1)}</AlertTitle>
      )}
      {message && <AlertDescription>{message}</AlertDescription>}
    </Alert>
  );
};
