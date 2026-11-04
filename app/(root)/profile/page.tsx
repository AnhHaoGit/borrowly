import Image from "next/image";
// Khi nối DB thật thì đổi thành "@/database/queries"
import {
  getUserById,
  getRentedBooksByUserId,
  type RentedBook,
} from "@/database/queries.mock";

const CURRENT_USER_ID = "alice";

const THEME = {
  page: "bg-[#fbf7e8]",
  card: "bg-[#f5d0c6] rounded-2xl shadow-sm",
  cardHover: "hover:shadow-md transition-shadow duration-200",
  cover: "bg-[#e8beba] rounded-xl",
  title: "text-[#62202f]",
  text: "text-[#62202f]/80",
  accent: "border-[#62202f]",
};

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Thẻ sách: Bìa sách rộng toàn bộ mặt trước, tối ưu không gian thẻ
function BookCard({ book }: { book: RentedBook }) {
  const overdue = book.status === "OVERDUE";

  return (
    <li className={`${THEME.card} ${THEME.cardHover} p-3 flex flex-col h-full`}>
      {/* Cover image prominently displayed at the front (full width) */}
      <div
        className={`relative aspect-[2/3] w-full mb-3 overflow-hidden shadow-sm ${THEME.cover}`}
      >
        <Image
          src={book.coverUrl}
          alt={`Cover of ${book.title}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          className="object-cover scale-[1.15] -translate-x-[7%]"
        />
      </div>

      <div className="flex flex-col flex-grow justify-between">
        <div>
          <h3 className={`text-base font-bold leading-tight line-clamp-2 ${THEME.title}`}>
            {book.title}
          </h3>

          <p className={`mt-0.5 text-xs font-medium ${THEME.text}`}>
            {book.authorName}
          </p>
        </div>

        {/* Dynamic due date stuck cleanly to the bottom */}
        {book.dueDate && (
          <div className="mt-3 border-t border-[#62202f]/15 pt-2">
            <p
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                overdue ? "text-red-700" : THEME.text
              }`}
            >
              {overdue ? "Overdue since" : "Due"}
            </p>
            <p className={`text-xs font-medium ${overdue ? "text-red-700 font-bold" : THEME.text}`}>
              {formatDate(book.dueDate)}
            </p>
          </div>
        )}
      </div>
    </li>
  );
}

export default async function ProfilePage() {
  const user = await getUserById(CURRENT_USER_ID);

  if (!user) {
    return (
      <div className={`min-h-[60vh] ${THEME.page} flex items-center justify-center`}>
        <p className={THEME.text}>We couldn&apos;t find your profile yet.</p>
      </div>
    );
  }

  const rentedBooks = await getRentedBooksByUserId(user.id);

  return (
    <div className={`min-h-[60vh] ${THEME.page}`}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Compact grid layout for profile sidebar & book section */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
          
          {/* Profile Details Sidebar */}
          <aside
            aria-label="Profile information"
            className={`${THEME.card} p-4 flex flex-row lg:flex-col items-center text-left lg:text-center gap-4 lg:sticky lg:top-20`}
          >
            <Image
              src="/Avatar.png"
              alt={`${user.fullName}'s avatar`}
              width={72}
              height={72}
              className={`rounded-full object-cover border-2 shrink-0 ${THEME.accent}`}
            />
            <div className="min-w-0 w-full">
              <h1 className={`text-lg font-bold break-words leading-tight ${THEME.title}`}>
                {user.fullName}
              </h1>
              <p className={`text-xs mt-0.5 break-all ${THEME.text}`}>{user.email}</p>
            </div>
          </aside>

          {/* Borrowed Books Section */}
          <section>
            <h2 className={`text-xl font-bold mb-3 ${THEME.title}`}>
              Borrowed Books
            </h2>

            {rentedBooks.length === 0 ? (
              <p className={`text-sm ${THEME.text}`}>
                You have yet to rent any books
              </p>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3.5">
                {rentedBooks.map((book) => (
                  <BookCard key={book.receiptId} book={book} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}