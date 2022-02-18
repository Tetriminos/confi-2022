import {MigrationInterface, QueryRunner} from "typeorm";

export class AddVerifyBooleanToBooking1645189108795 implements MigrationInterface {
    name = 'AddVerifyBooleanToBooking1645189108795'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking" ADD "verified" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "verified"`);
    }

}
