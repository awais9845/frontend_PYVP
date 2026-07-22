import { useCallback, useState } from "react";
import { AxiosError } from "axios";

/**
 * useApiError — extracts a human-readable error message from an Axios error
 * and exposes it alongside a clear function.
 */
export function useApiError() {
  const [apiError, setApiError] = useState<string | null>(null);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof AxiosError) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred.";
      setApiError(msg);
    } else if (error instanceof Error) {
      setApiError(error.message);
    } else {
      setApiError("An unknown error occurred.");
    }
  }, []);

  const clearApiError = useCallback(() => setApiError(null), []);

  return { apiError, handleError, clearApiError };
}
