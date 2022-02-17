import { MigrationInterface, QueryRunner } from 'typeorm';

// Custom seed file that inserts a conference with the name "NestJS Conf"
export class SeedAConference1644781052810 implements MigrationInterface {
  name = 'SeedAConference1644781052810';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO "conference" (name) VALUES ('NestJS Conf')`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Empty promise since we'll never need to revert this seed
    return new Promise(() => ({}));
  }
}
