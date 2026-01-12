import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('innings')
@Index(['matchId', 'inningsNumber'], { unique: true })
export class InningsEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    matchId!: string;

    @Column()
    battingTeamId!: string;

    @Column()
    bowlingTeamId!: string;

    @Column()
    inningsNumber!: number;

    @Column({ default: false })
    isCompleted!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
