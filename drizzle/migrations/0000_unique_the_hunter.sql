CREATE TABLE "session_chat" (
	"session_id" serial PRIMARY KEY NOT NULL,
	"doctor_id" text NOT NULL,
	"doctor_name" text NOT NULL,
	"specialization" text NOT NULL,
	"note" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "medical_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"patient_summary" text NOT NULL,
	"chief_complaints" jsonb NOT NULL,
	"symptoms" jsonb NOT NULL,
	"assessment" text NOT NULL,
	"recommendations" jsonb NOT NULL,
	"follow_up" text NOT NULL,
	"medications" jsonb NOT NULL,
	"risk_factors" jsonb NOT NULL,
	"report_date" timestamp NOT NULL,
	"consultation_summary" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"age" integer NOT NULL,
	"credits" integer DEFAULT 0,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
