"use client";

import { Toaster } from "sonner";
import {
  LuCircleAlert,
  LuCircleCheck,
  LuInfo,
  LuLoader,
  LuTriangleAlert,
} from "react-icons/lu";

export const TOAST_DURATION_MS = 3000;

const AppToaster = () => {
  return (
    <Toaster
      theme="light"
      position="bottom-right"
      duration={TOAST_DURATION_MS}
      visibleToasts={3}
      icons={{
        success: <LuCircleCheck className="size-5 text-secondary" />,
        error: <LuCircleAlert className="size-5 text-danger" />,
        info: <LuInfo className="size-5 text-secondary" />,
        warning: <LuTriangleAlert className="size-5 text-secondary" />,
        loading: <LuLoader className="size-5 animate-spin text-secondary" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-start gap-3 rounded-2xl border-2 bg-surface p-4 text-primary shadow-lift",
          icon: "mt-0.5 shrink-0",
          content: "flex flex-1 flex-col gap-0.5",
          title: "text-base font-bold leading-snug",
          description: "text-sm leading-snug text-muted",
          default: "border-accent",
          success: "border-accent-deep",
          info: "border-accent",
          warning: "border-accent-deep",
          error: "border-danger/50 bg-danger/5",
          loading: "border-accent",
        },
      }}
    />
  );
};

export default AppToaster;
