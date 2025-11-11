import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Article } from './entities/article.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    slug: string,
    authorId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const author = await this.usersRepository.findOne({
      where: { id: authorId },
    });

    if (!author) {
      throw new NotFoundException('User not found');
    }

    const comment = this.commentsRepository.create({
      body: createCommentDto.body,
      article,
      author,
    });

    return this.commentsRepository.save(comment);
  }

  async findAll(slug: string, currentUserId?: number): Promise<Comment[]> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const comments = await this.commentsRepository.find({
      where: { article: { id: article.id } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    return comments;
  }

  async remove(slug: string, commentId: number, userId: number): Promise<void> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, article: { id: article.id } },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.id !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.remove(comment);
  }

  formatCommentResponse(comment: Comment, currentUserId?: number): any {
    const author = comment.author;
    return {
      comment: {
        id: comment.id,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        body: comment.body,
        author: {
          username: author.username,
          bio: author.bio ?? null,
          image: author.image ?? null,
          following: false, // TODO: Implement follow functionality
        },
      },
    };
  }

  formatCommentsResponse(comments: Comment[], currentUserId?: number): any {
    return {
      comments: comments.map((comment) => {
        const author = comment.author;
        return {
          id: comment.id,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
          body: comment.body,
          author: {
            username: author.username,
            bio: author.bio ?? null,
            image: author.image ?? null,
            following: false, // TODO: Implement follow functionality
          },
        };
      }),
    };
  }
}

