import { useId, type ComponentProps, type ReactNode } from "react";

export interface TextFieldProps extends Omit<ComponentProps<"input">, "className"> {
  /** Nhãn hiện trên viền của ô nhập (giống thiết kế) */
  label: string;
  /** Thông báo lỗi: có thì ô đổi sang viền đỏ */
  error?: string;
  /** Gợi ý nhỏ bên dưới, ẩn đi khi đang có lỗi */
  hint?: string;
  /** Phần tử đặt bên phải trong ô, ví dụ nút con mắt của ô mật khẩu */
  trailing?: ReactNode;
}

/**
 * Ô nhập có nhãn nằm trên viền.
 * Dùng cho mọi form trong khu vực auth; muốn đổi giao diện ô nhập thì sửa đúng file này.
 */
const TextField = ({ label, error, hint, trailing, id, ...inputProps }: TextFieldProps) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div>
      <div className="relative">
        <label
          htmlFor={inputId}
          className="absolute -top-3 left-3 z-10 rounded-md border border-primary bg-accent px-2 text-sm font-bold text-primary"
        >
          {label}
        </label>

        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={message ? messageId : undefined}
          className={`h-14 w-full rounded-xl border-2 bg-surface px-4 text-lg text-primary outline-none transition placeholder:text-muted/50 focus:ring-4 focus:ring-accent/70 ${
            error ? "border-danger" : "border-primary"
          } ${trailing ? "pr-14" : ""}`}
          {...inputProps}
        />

        {trailing && <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div>}
      </div>

      {message && (
        <p
          id={messageId}
          role={error ? "alert" : undefined}
          className={`mt-1.5 px-1 text-sm ${error ? "text-danger" : "text-muted"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default TextField;
