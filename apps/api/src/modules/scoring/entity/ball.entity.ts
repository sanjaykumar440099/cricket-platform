import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('balls')
export class BallEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  matchId!: string;

  @Column()
  innings!: number;

  @Column()
  over!: number;

  @Column()
  ball!: number;

  @Column()
  runs!: number;

  @Column({ default: 0 })
  extraRuns!: number;

  @Column({ nullable: true })
  extraType!: string;

  @Column({ default: false })
  isWicket!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
