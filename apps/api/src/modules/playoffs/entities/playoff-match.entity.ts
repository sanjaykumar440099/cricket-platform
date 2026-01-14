import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { PlayoffStage } from '../playoff.rules';

@Entity('playoff_matches')
export class PlayoffMatchEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 36 })
    tournamentId!: string;

    @Column({
        type: 'enum',
        enum: [
            'QUALIFIER',
            'ELIMINATOR',
            'QUALIFIER_2',
            'SEMI_FINAL',
            'FINAL',
        ],
    })
    stage!: PlayoffStage;

    @Column({ type: 'varchar', length: 36 })
    teamAId!: string;

    @Column({ type: 'varchar', length: 36, nullable: true })
    teamBId!: string | null;

    @Column({ type: 'varchar', length: 36, nullable: true })
    winnerTeamId!: string | null;

    @Column({ default: false })
    isCompleted!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({
        type: 'enum',
        enum: ['STANDARD', 'IPL'],
    })
    format!: 'STANDARD' | 'IPL';
}
