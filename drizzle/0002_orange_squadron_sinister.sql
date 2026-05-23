CREATE TABLE "stock_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer,
	"item_name" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"type" varchar(10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_transaction_item_id" ON "stock_transactions" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "idx_transaction_created_at" ON "stock_transactions" USING btree ("created_at");