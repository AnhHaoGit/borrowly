import NextAuth, { User } from "next-auth";
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { getSessionUserState } from "@/database/users";
import { eq } from "drizzle-orm";
import type { Role } from "@/types/reader";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email.toString()))
          .limit(1);

        if (user.length === 0) return null;

        const isPasswordValid = await compare(
          credentials.password.toString(),
          user[0].password,
        );

        if (!isPasswordValid) return null;

        return {
          id: user[0].id.toString(),
          email: user[0].email,
          name: user[0].fullName,
          role: user[0].role,
        } as User;
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
      }

      const userId = token.id as string | undefined;

      if (!userId) return token;

      try {
        // Role trong token chỉ là ảnh chụp lúc đăng nhập. Đọc lại từ DB mỗi khi
        // session được đọc (thanh bên, /api/auth/session, server action...) để
        // việc cấp hoặc thu hồi quyền admin có hiệu lực mà không cần đăng nhập
        // lại. Đây cũng là chỗ ghi nhận hoạt động gần nhất của người dùng.
        const state = await getSessionUserState(userId);

        if (state) {
          token.role = state.role;
        } else {
          // Tài khoản đã bị xoá: vô hiệu hoá phiên thay vì giữ quyền cũ.
          token.id = "";
          token.role = "USER";
        }
      } catch (error) {
        // Lỗi DB tạm thời không được đăng xuất người dùng; các trang admin và
        // server action vẫn kiểm tra lại role từ DB nên không lọt quyền.
        console.error("Failed to refresh session role:", error);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.role = token.role as Role;
      }

      return session;
    },
  },
});
