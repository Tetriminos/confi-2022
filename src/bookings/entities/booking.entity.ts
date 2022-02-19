import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Conference } from '../../conferences/entities/conference.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ length: 50 })
  @ApiProperty()
  firstName: string;

  @Column({ length: 50 })
  @ApiProperty()
  lastName: string;

  @Column({ length: 320 })
  @ApiProperty()
  email: string;

  @Column({ length: 20 })
  entryCode: string;

  @Column({ default: false })
  @ApiProperty()
  verified: boolean;

  @ManyToOne(() => Conference, (conference) => conference.bookings)
  conference: Conference;
}
