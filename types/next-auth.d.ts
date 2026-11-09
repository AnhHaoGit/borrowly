import type { DefaultSession } from "next-auth";
import type { Role } from "./reader";

// NextAuth mặc định không có `id`/`role` trên session, trong khi toàn bộ app
// (profile, nhận diện admin, borrow) đều đọc hai trường này.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
  }
}
