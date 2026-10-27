import axios from "axios";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ApiError } from "../domain/models";
export function applyFormErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
) {
  if (axios.isAxiosError<ApiError>(error) && error.response?.data.fields) {
    for (const [name, message] of Object.entries(error.response.data.fields))
      setError(name as Path<T>, { type: "server", message });
  }
}
