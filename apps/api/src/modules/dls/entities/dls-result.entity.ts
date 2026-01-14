import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('dls_results')
export class DlsResultEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    matchId!: string;

    @Column()
    teamBattingSecondId!: string;

    @Column()
    originalTarget!: number;

    @Column()
    revisedTarget!: number;

    @Column()
    oversAvailable!: number;

    @Column()
    wicketsLost!: number;

    @CreateDateColumn()
    createdAt!: Date;
}
