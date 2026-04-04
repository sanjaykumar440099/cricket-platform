import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('commentary_entries')
@Index(['matchId', 'createdAt'])
export class CommentaryEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  matchId!: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  inningsId!: string | null;

  @Column({ type: 'int', nullable: true })
  overNumber!: number | null;

  @Column({ type: 'int', nullable: true })
  ballNumber!: number | null;

  @Column({
    type: 'enum',
    enum: ['ball', 'summary'],
    default: 'ball',
  })
  entryType!: 'ball' | 'summary';

  @Column({
    type: 'enum',
    enum: ['basic', 'enhanced', 'advanced'],
    default: 'basic',
  })
  style!: 'basic' | 'enhanced' | 'advanced';

  @Column({ type: 'varchar', length: 50, nullable: true })
  context!: string | null;

  @Column({ type: 'text' })
  text!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
