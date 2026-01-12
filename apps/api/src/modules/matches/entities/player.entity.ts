import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('players')
export class PlayerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;
}
