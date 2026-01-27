import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Player } from '../../players/entities/player.entity';

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

    @OneToMany(() => Player, player => player.team)
    players!: Player[];

    @CreateDateColumn()
    createdAt!: Date;
}
