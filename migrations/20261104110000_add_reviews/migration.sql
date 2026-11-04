ALTER TABLE "books" ADD COLUMN "rating_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_rating_count_non_negative" CHECK ("rating_count" >= 0);--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" smallint NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_rating_range" CHECK ("rating" >= 1 AND "rating" <= 10),
	CONSTRAINT "reviews_comment_length" CHECK ("comment" IS NULL OR char_length("comment") <= 1000)
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_book_user_unique" ON "reviews" USING btree ("book_id","user_id");--> statement-breakpoint
CREATE INDEX "reviews_book_updated_idx" ON "reviews" USING btree ("book_id","updated_at");--> statement-breakpoint
CREATE INDEX "reviews_user_idx" ON "reviews" USING btree ("user_id");
