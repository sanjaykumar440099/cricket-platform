import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Player } from '../../players/entities/player.entity';
import { TournamentEntity } from '../../tournaments/entities/tournament.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  shortName?: string;

  @Column({ nullable: true })
  logoUrl?: string;

  @ManyToOne(
    () => TournamentEntity,
    tournament => tournament.teams,
    { onDelete: 'CASCADE' },
  )
  tournament!: TournamentEntity;

  @OneToMany(() => Player, player => player.team)
  players!: Player[];

  @CreateDateColumn()
  createdAt!: Date;
}
