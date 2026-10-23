// database/queries.mock.ts
// Same function names as database/queries.ts, but the data lives in this file.
// No database or .env file needed.

export type User = {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: string; // ISO date, e.g. "2000-03-14"
  phone: string;
  avatarUrl: string;
};

export type RentedBook = {
  receiptId: string;
  status: "BORROWED" | "OVERDUE";
  dueDate: string | null; // "YYYY-MM-DD"
  bookId: string;
  title: string;
  authorName: string;
  coverUrl: string;
};

// Helper: a date string relative to today
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const mockUsers: User[] = [
  {
    id: "alice",
    fullName: "Alice Nguyen",
    email: "alice@example.com",
    dateOfBirth: "2000-03-14",
    phone: "(+84) 912 345 678",
    avatarUrl: "/Avatar.png",
  },
  {
    id: "bob",
    fullName: "Bob Tran",
    email: "bob@example.com",
    dateOfBirth: "1998-11-02",
    phone: "(+84) 987 654 321",
    avatarUrl: "/Avatar.png",
  },
];

const mockRentedBooks: Record<string, RentedBook[]> = {
  alice: [
    {
      receiptId: "r1",
      status: "BORROWED",
      dueDate: daysFromNow(9),
      bookId: "b1",
      title: "Book1",
      authorName: "Author One",
      coverUrl: "/Fantasy.png",
    },
    {
      receiptId: "r2",
      status: "OVERDUE",
      dueDate: daysFromNow(-16),
      bookId: "b2",
      title: "Book2",
      authorName: "Author Two",
      coverUrl: "/Romance.png",
    },
  ],
  // bob has no entry, so he gets an empty list
};

export async function getUserById(id: string) {
  return mockUsers.find((user) => user.id === id); // undefined if not found
}

export async function getRentedBooksByUserId(userId: string) {
  return mockRentedBooks[userId] ?? [];
}
