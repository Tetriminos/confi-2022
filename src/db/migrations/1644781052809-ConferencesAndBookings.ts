import {MigrationInterface, QueryRunner} from "typeorm";

export class ConferencesAndBookings1644781052809 implements MigrationInterface {
    name = 'ConferencesAndBookings1644781052809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "conference" ("id" SERIAL NOT NULL, "name" character varying(500) NOT NULL, CONSTRAINT "PK_e203a214f53b0eeefb3db00fdb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "booking" ("id" SERIAL NOT NULL, "firstName" character varying(50) NOT NULL, "lastName" character varying(50) NOT NULL, "email" character varying(320) NOT NULL, "entryCode" character varying(20) NOT NULL, "conferenceId" integer, CONSTRAINT "PK_49171efc69702ed84c812f33540" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_2e8431c5e7d6e952c90a5f22806" FOREIGN KEY ("conferenceId") REFERENCES "conference"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_2e8431c5e7d6e952c90a5f22806"`);
        await queryRunner.query(`DROP TABLE "booking"`);
        await queryRunner.query(`DROP TABLE "conference"`);
    }

}
