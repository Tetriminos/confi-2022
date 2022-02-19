import { IsString } from 'class-validator';

export class BookingCodeQueryParamDto {
  @IsString()
  code: string;
}
