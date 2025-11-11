import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Header,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { User } from '../auth/decorator/user.decorator';

@Controller('articles/:slug/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/json; charset=utf-8')
  async createComment(
    @Param('slug') slug: string,
    @Body() body: { comment: CreateCommentDto },
    @User() currentUser: any,
  ) {
    const comment = await this.commentsService.create(
      slug,
      currentUser.id,
      body.comment,
    );
    return this.commentsService.formatCommentResponse(comment, currentUser.id);
  }

  @Get()
  @Header('Content-Type', 'application/json; charset=utf-8')
  async getComments(
    @Param('slug') slug: string,
    @User() currentUser?: any,
  ) {
    const comments = await this.commentsService.findAll(slug, currentUser?.id);
    return this.commentsService.formatCommentsResponse(comments, currentUser?.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @User() currentUser: any,
  ) {
    await this.commentsService.remove(slug, parseInt(id, 10), currentUser.id);
    return { message: 'Comment deleted successfully' };
  }
}

