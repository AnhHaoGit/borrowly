const COLORS = {
  cream: "#fbf7e8",
  surface: "#fffcf3",
  blush: "#f5d0c6",
  rose: "#e8a396",
  coral: "#d98474",
  plum: "#9a4a60",
  wine: "#62202f",
} as const;

type BookSpec = readonly [width: number, height: number, color: string];

// Mỗi hàng sách: [rộng, cao, màu]. Khai báo tay để hình luôn giống nhau giữa server và client.
const SHELVES: { baseline: number; books: BookSpec[] }[] = [
  {
    baseline: 250,
    books: [
      [34, 120, COLORS.wine],
      [28, 96, COLORS.rose],
      [40, 132, COLORS.plum],
      [30, 108, COLORS.coral],
      [36, 124, COLORS.wine],
      [26, 90, COLORS.cream],
      [38, 138, COLORS.plum],
      [32, 104, COLORS.rose],
      [30, 116, COLORS.wine],
      [42, 128, COLORS.coral],
      [28, 98, COLORS.plum],
      [34, 112, COLORS.rose],
    ],
  },
  {
    baseline: 430,
    books: [
      [38, 126, COLORS.plum],
      [30, 100, COLORS.cream],
      [34, 134, COLORS.wine],
      [28, 92, COLORS.coral],
      [42, 122, COLORS.rose],
      [30, 110, COLORS.wine],
      [36, 136, COLORS.plum],
      [26, 96, COLORS.cream],
      [40, 118, COLORS.coral],
      [32, 128, COLORS.wine],
      [30, 102, COLORS.rose],
    ],
  },
  {
    baseline: 610,
    books: [
      [36, 112, COLORS.coral],
      [30, 132, COLORS.wine],
      [42, 104, COLORS.plum],
      [28, 124, COLORS.cream],
      [34, 94, COLORS.rose],
      [40, 130, COLORS.wine],
      [26, 108, COLORS.plum],
      [38, 120, COLORS.coral],
      [32, 100, COLORS.cream],
      [30, 126, COLORS.wine],
    ],
  },
];

const SHELF_LEFT = 60;
const BOOK_GAP = 5;

const Book = ({
  x,
  baseline,
  w,
  h,
  color,
}: {
  x: number;
  baseline: number;
  w: number;
  h: number;
  color: string;
}) => (
  <g>
    <rect x={x} y={baseline - h} width={w} height={h} rx={3} fill={color} />
    {/* hai dải màu và nhãn gáy sách */}
    <rect
      x={x}
      y={baseline - h + 14}
      width={w}
      height={4}
      fill={COLORS.cream}
      opacity={0.55}
    />
    <rect
      x={x}
      y={baseline - 22}
      width={w}
      height={4}
      fill={COLORS.cream}
      opacity={0.55}
    />
    <rect
      x={x + w / 2 - 2}
      y={baseline - h / 2 - 12}
      width={4}
      height={24}
      rx={2}
      fill={COLORS.cream}
      opacity={0.4}
    />
  </g>
);

const Shelf = ({
  baseline,
  books,
  leaning = false,
}: {
  baseline: number;
  books: BookSpec[];
  leaning?: boolean;
}) => {
  const renderedBooks = books.reduce<Array<{ x: number; w: number; h: number; color: string }>>(
    (items, [w, h, color]) => {
      const lastBook = items[items.length - 1];
      const x = lastBook ? lastBook.x + lastBook.w + BOOK_GAP : SHELF_LEFT;

      items.push({ x, w, h, color });
      return items;
    },
    []
  );

  const cursor =
    renderedBooks.length > 0
      ? renderedBooks[renderedBooks.length - 1].x +
        renderedBooks[renderedBooks.length - 1].w +
        BOOK_GAP
      : SHELF_LEFT;

  return (
    <g>
      {renderedBooks.map(({ x, w, h, color }, i) => (
        <Book key={i} x={x} baseline={baseline} w={w} h={h} color={color} />
      ))}

      {/* một cuốn nghiêng ở cuối hàng */}
      {leaning && (
        <g transform={`rotate(14 ${cursor + 6} ${baseline})`}>
          <Book
            x={cursor + 6}
            baseline={baseline}
            w={32}
            h={116}
            color={COLORS.plum}
          />
        </g>
      )}

      {/* ván kệ + bóng đổ nhẹ bên dưới */}
      <rect
        x={30}
        y={baseline}
        width={540}
        height={14}
        rx={4}
        fill={COLORS.wine}
      />
      <rect
        x={38}
        y={baseline + 14}
        width={524}
        height={10}
        rx={5}
        fill={COLORS.wine}
        opacity={0.12}
      />
    </g>
  );
};

const AuthIllustration = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 600 700"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="auth-art-bg" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#f9dfd6" />
          <stop offset="1" stopColor="#eeae9f" />
        </linearGradient>
      </defs>

      {/* nền + vòng tròn mờ trang trí */}
      <rect width="600" height="700" fill="url(#auth-art-bg)" />
      <circle cx="500" cy="80" r="150" fill={COLORS.cream} opacity={0.35} />
      <circle cx="80" cy="640" r="170" fill={COLORS.surface} opacity={0.25} />
      <circle cx="505" cy="72" r="34" fill={COLORS.cream} opacity={0.85} />
      <circle cx="120" cy="64" r="6" fill={COLORS.wine} opacity={0.25} />
      <circle cx="180" cy="96" r="4" fill={COLORS.wine} opacity={0.2} />
      <circle cx="330" cy="52" r="5" fill={COLORS.wine} opacity={0.2} />

      {/* ba kệ sách */}
      {SHELVES.map((shelf, i) => (
        <Shelf
          key={shelf.baseline}
          baseline={shelf.baseline}
          books={shelf.books}
          leaning={i === 1}
        />
      ))}

      {/* chậu cây trên kệ cuối */}
      <g>
        <path d="M498 610 h46 l-7 -40 h-32 z" fill={COLORS.coral} />
        <ellipse
          cx="521"
          cy="546"
          rx="9"
          ry="28"
          fill={COLORS.plum}
          transform="rotate(-22 521 566)"
        />
        <ellipse cx="521" cy="544" rx="9" ry="30" fill={COLORS.wine} />
        <ellipse
          cx="521"
          cy="546"
          rx="9"
          ry="28"
          fill={COLORS.plum}
          transform="rotate(22 521 566)"
        />
      </g>
    </svg>
  );
};

export default AuthIllustration;
