import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TournamentEntity } from '../../tournaments/entities/tournament.entity';
import { Team } from '../../teams/entities/team.entity';

@Entity('matches')
export class MatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // --------------------
  // TOURNAMENT
  // --------------------
  @Column({ type: 'varchar', length: 36, nullable: true })
  tournamentId!: string | null;

  @ManyToOne(() => TournamentEntity, tournament => tournament.matches, {
    nullable: true,
  })
  @JoinColumn({ name: 'tournamentId' })
  tournament!: TournamentEntity | null;

  // --------------------
  // TEAMS
  // --------------------
  @Column({ type: 'varchar', length: 36 })
  teamAId!: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'teamAId' })
  teamA!: Team;

  @Column({ type: 'varchar', length: 36 })
  teamBId!: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'teamBId' })
  teamB!: Team;

  // --------------------
  // MATCH CONFIG
  // --------------------
  @Column({ type: 'int' })
  oversLimit!: number;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'live', 'completed'],
    default: 'scheduled',
  })
  status!: 'scheduled' | 'live' | 'completed';

  // --------------------
  // RESULT
  // --------------------
  @Column({ type: 'varchar', length: 36, nullable: true })
  winnerTeamId!: string | null;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'winnerTeamId' })
  winnerTeam!: Team | null;

  @Column({ type: 'boolean', default: false })
  isTie!: boolean;

  @Column({ type: 'boolean', default: false })
  isNoResult!: boolean;

  // --------------------
  // TIMING
  // --------------------
  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  startTime!: Date | null;
}
