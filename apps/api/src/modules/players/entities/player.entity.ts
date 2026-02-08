import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  role?: string;

  @ManyToOne(() => Team, team => team.players, {
    onDelete: 'CASCADE',
  })
  team!: Team;

  @CreateDateColumn()
  createdAt!: Date;
}
