import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  Index,
  Unique,
} from 'typeorm';
import { Article } from './article.entity';

@Entity({ name: 'tags' })
@Unique(['name'])
@Index(['name'])
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Article, (article) => article.tags)
  articles: Article[];
}

