import Image from "next/image";
import {
  getUserById,
  getRentedBooksByUserId,
  type RentedBook,
} from "@/database/queries.mock";

// Change to "bob" to see the empty state
const CURRENT_USER_ID = "alice";

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function BookCard({ book }: { book: RentedBook }) {
  return (
    <li className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
      <div className="relative h-48 bg-gray-200 rounded mb-4 overflow-hidden">
        <Image
          src={book.coverUrl}
          alt={`Cover of ${book.title}`}
          fill
          sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain"
        />
      </div>
      <h3 className="font-bold text-gray-900">{book.title}</h3>
      <p className="text-sm text-gray-500">{book.authorName}</p>
      {book.dueDate && (
        <p
          className={`text-sm mt-2 ${
            book.status === "OVERDUE" ? "text-red-600" : "text-gray-600"
          }`}
        >
          {book.status === "OVERDUE" ? "Overdue since " : "Due "}
          {formatDate(book.dueDate)}
        </p>
      )}
    </li>
  );
}

export default async function ProfilePage() {
  const user = await getUserById(CURRENT_USER_ID);

  if (!user) {
    return (
      <main className="min-h-screen bg-[#fbf7e8] flex items-center justify-center">
        <p className="text-gray-700">We couldn&apos;t find your profile yet.</p>
      </main>
    );
  }

  const rentedBooks = await getRentedBooksByUserId(user.id);

  return (
    <main className="min-h-screen bg-[#fbf7e8]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">My Profile</h1>

        {/* Profile info */}
        <section
          aria-label="Profile information"
          className="bg-white p-6 rounded-lg shadow-md mb-8 flex items-center gap-6"
        >
          <Image
            src={user.avatarUrl}
            alt={`${user.fullName}'s avatar`}
            width={96}
            height={96}
            className="rounded-full object-cover border-2 border-indigo-500"
          />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {user.fullName}
            </h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-600">{user.phone}</p>
            <p className="text-gray-600">
              Born {formatDate(user.dateOfBirth)}
            </p>
          </div>
        </section>

        {/* Rented books */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Rented Books</h2>

          {rentedBooks.length === 0 ? (
            <p className="text-gray-700">You have yet to rent any books</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {rentedBooks.map((book) => (
                <BookCard key={book.receiptId} book={book} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
