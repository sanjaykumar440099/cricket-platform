import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tournaments')
export class TournamentEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column()
    format!: 'T20' | 'ODI' | 'TEST';

    @CreateDateColumn()
    createdAt!: Date;
}
