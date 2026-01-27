import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { MatchEntity } from '../../matches/entities/match.entity';

@Entity('tournaments')
export class TournamentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({
    type: 'enum',
    enum: ['T20', 'ODI', 'TEST'],
  })
  format!: 'T20' | 'ODI' | 'TEST';

  @ManyToMany(() => Team)
  @JoinTable({
    name: 'tournament_teams',
  })
  teams!: Team[];

  @OneToMany(() => MatchEntity, match => match.tournament)
  matches!: MatchEntity[];

  @CreateDateColumn()
  createdAt!: Date;
}
