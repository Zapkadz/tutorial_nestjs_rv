import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Article } from './article.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'comments' })
@Index(['article'])
@Index(['author'])
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  body: string;

  @ManyToOne(() => Article, (article) => article.comments, { onDelete: 'CASCADE' })
  article: Article;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  author: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

