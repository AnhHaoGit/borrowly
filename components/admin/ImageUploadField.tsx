"use client";

import { useRef, useState } from "react";
import { LuImagePlus, LuLoaderCircle, LuTrash2 } from "react-icons/lu";
import { notify } from "@/lib/toast";

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  hint?: string;
}

/**
 * Ô chọn ảnh: đẩy file lên cloud qua route admin rồi trả URL về form, nên
 * database vẫn lưu đúng một đường dẫn ảnh như trước.
 */
const ImageUploadField = ({
  id,
  label,
  value,
  onChange,
  error,
  hint = "JPG, PNG, WebP, AVIF or GIF · up to 5 MB.",
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body,
      });

      const payload = (await response.json().catch(() => null)) as
        | { url?: string; message?: string }
        | null;

      if (!response.ok || !payload?.url) {
        notify.error(payload?.message ?? "The image couldn't be uploaded.");
        return;
      }

      onChange(payload.url);
      notify.success("Image uploaded");
    } catch {
      notify.error(
        "The image couldn't be uploaded. Check your connection and try again.",
      );
    } finally {
      setUploading(false);

      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const pick = (files: FileList | null) => {
    const file = files?.[0];

    if (file) void upload(file);
  };

  const border = error ? "border-danger" : "border-accent-deep/40";

  return (
    <div>
      <span className="mb-1.5 block text-sm font-bold text-primary">
        {label}
      </span>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!uploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!uploading) pick(event.dataTransfer.files);
        }}
        className={`flex flex-wrap items-center gap-2 rounded-xl border-2 border-dashed px-3 py-2.5 transition ${
          dragging ? "border-secondary bg-accent/40" : `${border} bg-background`
        }`}
      >
        <label
          htmlFor={id}
          aria-disabled={uploading}
          className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-accent-deep bg-accent px-4 text-sm text-primary transition hover:bg-accent-deep ${
            uploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {uploading ? (
            <LuLoaderCircle className="size-4 animate-spin" />
          ) : (
            <LuImagePlus className="size-4" />
          )}
          {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
        </label>

        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={uploading}
          aria-describedby={`${id}-hint`}
          onChange={(event) => pick(event.target.files)}
        />

        {value && !uploading && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-danger/40 px-3 text-sm text-danger transition hover:bg-danger/10"
          >
            <LuTrash2 className="size-4" />
            Remove
          </button>
        )}

        <span id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </span>
      </div>

      {error && <p className="mt-1 text-sm text-danger">{error}</p>}

      {value && (
        <p className="mt-1.5 break-all text-xs text-muted">{value}</p>
      )}
    </div>
  );
};

export default ImageUploadField;
