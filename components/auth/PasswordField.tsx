"use client";

import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import TextField, { type TextFieldProps } from "./TextField";

const PasswordField = (props: Omit<TextFieldProps, "type" | "trailing">) => {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className="grid size-10 place-items-center rounded-full text-secondary transition hover:bg-accent/60 hover:text-primary focus-visible:outline-2 focus-visible:outline-secondary"
        >
          {visible ? <LuEyeOff className="size-5" /> : <LuEye className="size-5" />}
        </button>
      }
    />
  );
};

export default PasswordField;
