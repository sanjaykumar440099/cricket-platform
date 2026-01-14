import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('matches')
export class MatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  tournamentId!: string | null;

  @Column({ type: 'varchar', length: 36 })
  teamAId!: string;

  @Column({ type: 'varchar', length: 36 })
  teamBId!: string;

  @Column({ type: 'int' })
  oversLimit!: number;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'live', 'completed'],
    default: 'scheduled',
  })
  status!: 'scheduled' | 'live' | 'completed';

  @Column({ type: 'varchar', length: 36, nullable: true })
  winnerTeamId!: string | null;

  @Column({ type: 'boolean', default: false })
  isTie!: boolean;

  @Column({ type: 'boolean', default: false })
  isNoResult!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
