import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Article } from './entities/article.entity';
import { Tag } from './entities/tag.entity';
import { Favorite } from './entities/favorite.entity';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Tag, Favorite, Comment, User]),
  ],
  controllers: [ArticlesController, CommentsController],
  providers: [ArticlesService, CommentsService],
  exports: [ArticlesService],
})
export class ArticlesModule {}

