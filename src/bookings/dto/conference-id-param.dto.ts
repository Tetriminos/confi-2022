import { IsNumberString } from 'class-validator';

export class ConferenceIdParamDto {
  @IsNumberString()
  conferenceId: string;
}
