CREATE TYPE "public"."borrower_type" AS ENUM('student', 'instructor', 'staff');--> statement-breakpoint
CREATE TYPE "public"."tool_status" AS ENUM('available', 'borrowed', 'missing', 'unreturned');--> statement-breakpoint
CREATE TYPE "public"."tool_transaction_type" AS ENUM('borrowed', 'returned', 'correction');--> statement-breakpoint
CREATE TABLE "borrowers" (
	"id" text PRIMARY KEY NOT NULL,
	"school_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"image" text,
	"type" "borrower_type" DEFAULT 'student' NOT NULL,
	"program" text,
	"year_level" integer,
	"section" text,
	"contact_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "borrowers_school_id_unique" UNIQUE("school_id"),
	CONSTRAINT "borrowers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "tool_transactions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tool_transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tool_id" integer NOT NULL,
	"borrower_id" text,
	"borrower_name" text NOT NULL,
	"transaction_type" "tool_transaction_type" NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tools_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"barcode" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"current_status" "tool_status" DEFAULT 'available' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tools_barcode_unique" UNIQUE("barcode")
);
--> statement-breakpoint
ALTER TABLE "tool_transactions" ADD CONSTRAINT "tool_transactions_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_transactions" ADD CONSTRAINT "tool_transactions_borrower_id_borrowers_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."borrowers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "borrowers_school_id_idx" ON "borrowers" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "borrowers_type_idx" ON "borrowers" USING btree ("type");--> statement-breakpoint
CREATE INDEX "tool_transactions_tool_id_idx" ON "tool_transactions" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "tool_transactions_borrower_id_idx" ON "tool_transactions" USING btree ("borrower_id");--> statement-breakpoint
CREATE INDEX "tool_transactions_recorded_at_idx" ON "tool_transactions" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "tool_transactions_borrower_name_idx" ON "tool_transactions" USING btree ("borrower_name");--> statement-breakpoint
CREATE INDEX "tools_barcode_idx" ON "tools" USING btree ("barcode");--> statement-breakpoint
CREATE INDEX "tools_current_status_idx" ON "tools" USING btree ("current_status");