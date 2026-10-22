import Image from "next/image";

// type
type User = {
  name: string;
  email: string;
  dateOfBirth: string; // ISO date, e.g. "2020-12-18"
  phone: string;
  avatarUrl: string;
};

type RentedBook = {
  id: number;
  title: string;
  author: string;
  coverUrl: string;
};

//Mock data 
const mockUser: User = {
  name: "Yamini Gowda",
  email: "yamini_gowda@home.com",
  dateOfBirth: "2020-12-18",
  phone: "(+91) 979839999",
  avatarUrl: "/Avatar.png",
};

const mockRentedBooks: RentedBook[] = [
  { id: 1, title: "Fantasy", author: "Author1", coverUrl: "/Fantasy.png" },
  { id: 2, title: "Romance", author: "Author2", coverUrl: "/Romance.png" },
];

// Helpers
// Fixed locale + UTC time zone
function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

//Components 
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
      <p className="text-sm text-gray-500">{book.author}</p>
    </li>
  );
}

// Default export
export default function ProfilePage() {
  return (
    // The shared header/footer belong in layout.tsx, so this page only returns its content.
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">My Profile</h1>

        {/* Profile info */}
        <section
          aria-label="Profile information"
          className="bg-white p-6 rounded-lg shadow-md mb-8 flex items-center gap-6"
        >
          <Image
            src={mockUser.avatarUrl}
            alt={`${mockUser.name}'s avatar`}
            width={96}
            height={96}
            className="rounded-full object-cover border-2 border-indigo-500"
          />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {mockUser.name}
            </h2>
            <p className="text-gray-600">{mockUser.email}</p>
            <p className="text-gray-600">{mockUser.phone}</p>
            <p className="text-gray-600">
              Born {formatDate(mockUser.dateOfBirth)}
            </p>
          </div>
        </section>

        {/* Rented books */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Rented Books</h2>

          {mockRentedBooks.length === 0 ? (
            <p className="text-gray-500">You haven&apos;t rented any books yet.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {mockRentedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
