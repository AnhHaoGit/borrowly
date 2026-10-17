ALTER TABLE "books" ADD COLUMN "rating" real;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "borrow_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "language" text NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "subjects" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "subject_places" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "subject_times" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "publishers" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
CREATE INDEX "books_borrow_count_idx" ON "books" ("borrow_count");--> statement-breakpoint
CREATE INDEX "books_subjects_idx" ON "books" USING gin ("subjects");--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_borrow_count_non_negative" CHECK ("borrow_count" >= 0);--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_rating_range" CHECK ("rating" IS NULL OR ("rating" >= 0 AND "rating" <= 5));