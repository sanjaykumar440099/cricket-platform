import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('matches')
export class MatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  teamAId!: string;

  @Column()
  teamBId!: string;

  @Column()
  oversLimit!: number;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'live', 'completed'],
    default: 'scheduled',
  })
  status!: 'scheduled' | 'live' | 'completed';

  @Column({ type: 'datetime', nullable: true })
  startTime?: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
