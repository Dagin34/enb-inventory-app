ALTER TABLE "inventory_items" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "category" varchar(100) DEFAULT 'Uncategorized';--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "image_cloudinary_id" text;--> statement-breakpoint
CREATE INDEX "idx_category" ON "inventory_items" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_created_at" ON "inventory_items" USING btree ("created_at");