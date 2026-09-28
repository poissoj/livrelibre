export type FormResult<T extends string = "error" | "success"> = {
  type: T;
  msg: string;
};

export type AlertType = "success" | "warning" | "error" | "info";

export type AlertMessage = {
  type: AlertType;
  message: string;
};
