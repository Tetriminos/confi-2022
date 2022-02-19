import { Controller } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

// Controller left in place for a multi-conference future
@ApiBearerAuth()
@Controller()
export class ConferencesController {}
