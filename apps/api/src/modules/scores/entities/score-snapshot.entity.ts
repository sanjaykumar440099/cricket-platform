import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('score_snapshots')
export class ScoreSnapshotEntity {
    @PrimaryColumn()
    inningsId!: string;

    @Column()
    totalRuns!: number;

    @Column()
    wickets!: number;

    @Column()
    completedOvers!: number;

    @Column()
    ballsInOver!: number;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ default: false })
    isFreeHit!: boolean;

    @Column({ default: true })
    isPowerplay!: boolean;

    @Column({
        type: 'varchar',
        length: 10,
        nullable: true,
    })
    powerplayPhase!: string | null;


    @Column()
    maxFieldersOutside!: number;
}
