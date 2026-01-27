import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1706266800000 implements MigrationInterface {
  name = 'InitialSchema1706266800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar NOT NULL UNIQUE,
        "password" varchar NOT NULL,
        "first_name" varchar NOT NULL,
        "last_name" varchar NOT NULL,
        "role" varchar NOT NULL DEFAULT 'viewer',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create assets table
    await queryRunner.query(`
      CREATE TABLE "assets" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "file_name" varchar NOT NULL,
        "original_name" varchar NOT NULL,
        "file_size" bigint NOT NULL,
        "mime_type" varchar NOT NULL,
        "type" varchar NOT NULL,
        "status" varchar NOT NULL DEFAULT 'uploading',
        "metadata" jsonb NOT NULL,
        "thumbnail_url" varchar,
        "preview_url" varchar,
        "download_url" varchar NOT NULL,
        "tags" text NOT NULL DEFAULT '',
        "description" text,
        "uploaded_by" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_assets_uploaded_by" FOREIGN KEY ("uploaded_by") 
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create collections table
    await queryRunner.query(`
      CREATE TABLE "collections" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "description" text,
        "asset_ids" text NOT NULL DEFAULT '',
        "created_by" uuid NOT NULL,
        "is_public" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_collections_created_by" FOREIGN KEY ("created_by") 
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_assets_status" ON "assets" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_assets_type" ON "assets" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_assets_created_at" ON "assets" ("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_assets_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_assets_type"`);
    await queryRunner.query(`DROP INDEX "IDX_assets_status"`);
    await queryRunner.query(`DROP TABLE "collections"`);
    await queryRunner.query(`DROP TABLE "assets"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
