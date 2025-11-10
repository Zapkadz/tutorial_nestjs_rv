import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Header,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleQueryDto } from './dto/article-query.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { User } from '../auth/decorator/user.decorator';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @Header('Content-Type', 'application/json; charset=utf-8')
  async getArticles(@Query() query: ArticleQueryDto, @User() currentUser?: any) {
    const result = await this.articlesService.findAll(query, currentUser?.id);
    return this.articlesService.formatArticlesResponse(result.articles, result.articlesCount);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/json; charset=utf-8')
  async getFeed(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @User() currentUser?: any,
  ) {
    const result = await this.articlesService.findFeed(
      currentUser.id,
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0,
    );
    return this.articlesService.formatArticlesResponse(result.articles, result.articlesCount);
  }

  @Get(':slug')
  @Header('Content-Type', 'application/json; charset=utf-8')
  async getArticle(@Param('slug') slug: string, @User() currentUser?: any) {
    const article = await this.articlesService.findOneBySlug(slug, currentUser?.id);
    return this.articlesService.formatArticleResponse(article, true);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/json; charset=utf-8')
  async createArticle(
    @Body() body: { article: CreateArticleDto },
    @User() currentUser: any,
  ) {
    const article = await this.articlesService.create(currentUser.id, body.article);
    return this.articlesService.formatArticleResponse(article, true);
  }

  @Put(':slug')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/json; charset=utf-8')
  async updateArticle(
    @Param('slug') slug: string,
    @Body() body: { article: UpdateArticleDto },
    @User() currentUser: any,
  ) {
    const article = await this.articlesService.update(slug, currentUser.id, body.article);
    return this.articlesService.formatArticleResponse(article, true);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  async deleteArticle(@Param('slug') slug: string, @User() currentUser: any) {
    await this.articlesService.remove(slug, currentUser.id);
    return { message: 'Article deleted successfully' };
  }
}

