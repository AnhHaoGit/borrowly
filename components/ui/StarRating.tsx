"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { LuStar } from "react-icons/lu";

const MAX_STARS = 5;
const HALF_STEPS = MAX_STARS * 2;

const SIZES = {
  sm: "size-3.5",
  md: "size-5",
  lg: "size-7",
} as const;

type StarSize = keyof typeof SIZES;

const clampStars = (value: number) => Math.min(MAX_STARS, Math.max(0, value));

interface StarRatingProps {
  /** 0..5, cho phép số lẻ (4.3) để vẽ phần sao lấp lửng. */
  value: number;
  size?: StarSize;
  className?: string;
}

/** Hiển thị số sao (chỉ đọc), phần lẻ được cắt theo chiều rộng. */
export const StarRating = ({
  value,
  size = "md",
  className = "",
}: StarRatingProps) => {
  const clamped = clampStars(value);

  return (
    <span
      role="img"
      aria-label={`${clamped.toFixed(1)} out of ${MAX_STARS} stars`}
      className={`relative inline-flex ${className}`}
    >
      <span className="flex gap-0.5 text-accent-deep/40" aria-hidden="true">
        {Array.from({ length: MAX_STARS }, (_, index) => (
          <LuStar key={index} className={`${SIZES[size]} shrink-0`} />
        ))}
      </span>

      <span
        className="pointer-events-none absolute inset-0 flex gap-0.5 overflow-hidden text-primary"
        style={{ width: `${(clamped / MAX_STARS) * 100}%` }}
        aria-hidden="true"
      >
        {Array.from({ length: MAX_STARS }, (_, index) => (
          <LuStar
            key={index}
            className={`${SIZES[size]} shrink-0 fill-current`}
          />
        ))}
      </span>
    </span>
  );
};

interface StarRatingInputProps {
  /** Nửa sao: 0 = chưa chọn, 1..10 = 0.5★..5★. */
  value: number;
  onChange: (next: number) => void;
  size?: StarSize;
  disabled?: boolean;
  className?: string;
}

/** Chọn điểm bằng nửa sao, hỗ trợ bàn phím (mũi tên trái/phải) theo chuẩn radiogroup. */
export const StarRatingInput = ({
  value,
  onChange,
  size = "lg",
  disabled = false,
  className = "",
}: StarRatingInputProps) => {
  const [hovered, setHovered] = useState(0);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // `preview` luôn tính theo nửa sao để hover phản hồi đúng từng nấc.
  const preview = hovered || value;

  const focusStep = (halfStars: number) => {
    buttonsRef.current[halfStars - 1]?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    halfStars: number,
  ) => {
    const forward =
      event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : 0;
    const backward =
      event.key === "ArrowLeft" || event.key === "ArrowDown" ? 1 : 0;

    if (!forward && !backward) return;

    event.preventDefault();

    const next = Math.min(
      HALF_STEPS,
      Math.max(1, halfStars + (forward ? 1 : -1)),
    );

    onChange(next);
    focusStep(next);
  };

  const tabbable = value > 0 ? value : 1;

  return (
    <div
      className={`inline-flex flex-col items-start gap-1.5 ${className}`}
      onMouseLeave={() => setHovered(0)}
    >
      <div
        role="radiogroup"
        aria-label="Your rating"
        aria-disabled={disabled}
        className="relative inline-flex"
      >
        <StarRating value={preview / 2} size={size} />

        <div className="absolute inset-0 flex">
          {Array.from({ length: HALF_STEPS }, (_, index) => {
            const halfStars = index + 1;
            const stars = halfStars / 2;
            const checked = value === halfStars;

            return (
              <button
                key={halfStars}
                ref={(element) => {
                  buttonsRef.current[index] = element;
                }}
                type="button"
                role="radio"
                aria-checked={checked}
                aria-label={`${stars} star${stars === 1 ? "" : "s"}`}
                tabIndex={halfStars === tabbable ? 0 : -1}
                disabled={disabled}
                onMouseEnter={() => setHovered(halfStars)}
                onFocus={() => setHovered(halfStars)}
                onBlur={() => setHovered(0)}
                onClick={() => onChange(halfStars)}
                onKeyDown={(event) => handleKeyDown(event, halfStars)}
                style={{ width: `${100 / HALF_STEPS}%` }}
                className="h-full cursor-pointer rounded-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed"
              />
            );
          })}
        </div>
      </div>

      <span className="text-xs text-muted">
        {preview > 0 ? `${(preview / 2).toFixed(1)} / 5` : "Tap a star to rate"}
      </span>
    </div>
  );
};
