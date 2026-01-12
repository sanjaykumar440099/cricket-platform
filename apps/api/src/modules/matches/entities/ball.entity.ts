import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('balls')
@Index(['inningsId', 'overNumber'])
@Index(['inningsId', 'createdAt'])
export class BallEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    inningsId!: string;

    @Column()
    overNumber!: number;

    @Column()
    ballNumber!: number;

    @Column()
    strikerId!: string;

    @Column()
    nonStrikerId!: string;

    @Column()
    bowlerId!: string;

    @Column()
    runsOffBat!: number;

    @Column()
    extras!: number;

    @Column({
        type: 'enum',
        enum: ['wide', 'no-ball', 'bye', 'leg-bye'],
        nullable: true,
    })
    extraType?: 'wide' | 'no-ball' | 'bye' | 'leg-bye';

    @Column()
    isWicket!: boolean;

    @Column({ nullable: true })
    dismissedPlayerId?: string;

    @CreateDateColumn()
    createdAt!: Date;
}
