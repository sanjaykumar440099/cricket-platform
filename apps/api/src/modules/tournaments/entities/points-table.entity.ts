import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('points_table')
@Index(['tournamentId', 'teamId'], { unique: true })
export class PointsTableEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    tournamentId!: string;

    @Column()
    teamId!: string;

    @Column({ default: 0 })
    matches!: number;

    @Column({ default: 0 })
    wins!: number;

    @Column({ default: 0 })
    losses!: number;

    @Column({ default: 0 })
    ties!: number;

    @Column({ default: 0 })
    noResults!: number;

    @Column({ default: 0 })
    points!: number;

    @Column({ type: 'float', default: 0 })
    netRunRate!: number;

    @Column({ type: 'float', default: 0 })
    runsFor!: number;

    @Column({ type: 'float', default: 0 })
    oversFaced!: number;

    @Column({ type: 'float', default: 0 })
    runsAgainst!: number;

    @Column({ type: 'float', default: 0 })
    oversBowled!: number;
}
