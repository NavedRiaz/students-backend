import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudentRefactor1764607640962 implements MigrationInterface {
  // instruct what needs to be changed and how
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "student" RENAME COLUMN "name" TO "title";`,
    );
  }

  // undo or rollback any of those changes, just in case an issue comes up
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "student" RENAME COLUMN "title" TO "name";`,
    );
  }
}
