import {MigrationInterface, QueryRunner} from "typeorm";

export class AddPhoneNumberToBooking1645801425396 implements MigrationInterface {
    name = 'AddPhoneNumberToBooking1645801425396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking" ADD "phoneNumber" character varying(16) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "phoneNumber"`);
    }

}
