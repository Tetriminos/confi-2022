import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Conference } from '../../conferences/entities/conference.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ length: 320 })
  email: string;

  @Column({ length: 20 })
  entryCode: string;

  @Column({ default: false })
  verified: boolean;

  @ManyToOne(() => Conference, (conference) => conference.bookings)
  conference: Conference;
}
