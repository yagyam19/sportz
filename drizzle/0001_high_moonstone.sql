ALTER TABLE "matches" ADD COLUMN "external_id" text;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "league" text;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_match_sequence" ON "commentary" USING btree ("match_id","sequence");--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_external_id_unique" UNIQUE("external_id");