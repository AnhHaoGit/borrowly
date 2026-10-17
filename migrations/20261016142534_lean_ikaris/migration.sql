CREATE TYPE "borrow_status" AS ENUM('PENDING', 'BORROWED', 'RETURNED', 'OVERDUE', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" varchar(255) NOT NULL,
	"author_name" varchar(255) NOT NULL,
	"genre" text NOT NULL,
	"publish_year" integer NOT NULL,
	"cover_url" text NOT NULL,
	"summary" text NOT NULL,
	"description" text NOT NULL,
	"available_quantity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "books_quantity_non_negative" CHECK ("available_quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"status" "borrow_status" DEFAULT 'PENDING'::"borrow_status" NOT NULL,
	"borrow_date" timestamp with time zone,
	"due_date" date,
	"return_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"full_name" varchar(255) NOT NULL,
	"email" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	"role" "role" DEFAULT 'USER'::"role" NOT NULL,
	"last_activity_date" date DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "books_genre_idx" ON "books" ("genre");--> statement-breakpoint
CREATE INDEX "books_publish_year_idx" ON "books" ("publish_year");--> statement-breakpoint
CREATE INDEX "receipts_user_idx" ON "receipts" ("user_id");--> statement-breakpoint
CREATE INDEX "receipts_book_idx" ON "receipts" ("book_id");--> statement-breakpoint
CREATE INDEX "receipts_status_idx" ON "receipts" ("status");--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_book_id_books_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id");