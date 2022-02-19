import { IsNumberString } from 'class-validator';

export class RemoveBookingParamsDto {
  @IsNumberString()
  conferenceId: string;

  @IsNumberString()
  id: string;
}
