import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tag } from './tag.entity';
import { Favorite } from './favorite.entity';
import { Comment } from './comment.entity';

@Entity({ name: 'articles' })
@Unique(['slug'])
@Index(['author'])
@Index(['createdAt'])
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  body: string;

  @ManyToOne(() => User, (user) => user.articles, { eager: true, onDelete: 'CASCADE' })
  author: User;

  @ManyToMany(() => Tag, (tag) => tag.articles, { eager: true, cascade: true })
  @JoinTable({
    name: 'article_tags',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @OneToMany(() => Favorite, (favorite) => favorite.article)
  favorites: Favorite[];

  @OneToMany(() => Comment, (comment) => comment.article)
  comments: Comment[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

