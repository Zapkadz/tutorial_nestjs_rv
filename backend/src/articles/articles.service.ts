import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Article } from './entities/article.entity';
import { Tag } from './entities/tag.entity';
import { Favorite } from './entities/favorite.entity';
import { User } from '../users/entities/user.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleQueryDto } from './dto/article-query.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async ensureSlugUnique(slug: string, excludeId?: number): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existing = await this.articlesRepository.findOne({
        where: { slug: uniqueSlug },
      });
      if (!existing || (excludeId && existing.id === excludeId)) {
        break;
      }
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    return uniqueSlug;
  }

  private async findOrCreateTags(tagNames: string[]): Promise<Tag[]> {
    if (!tagNames || tagNames.length === 0) {
      return [];
    }

    const tags: Tag[] = [];
    for (const name of tagNames) {
      let tag = await this.tagsRepository.findOne({ where: { name } });
      if (!tag) {
        tag = this.tagsRepository.create({ name });
        tag = await this.tagsRepository.save(tag);
      }
      tags.push(tag);
    }
    return tags;
  }

  async create(authorId: number, createArticleDto: CreateArticleDto): Promise<Article> {
    const author = await this.usersRepository.findOne({ where: { id: authorId } });
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    const slug = await this.ensureSlugUnique(this.generateSlug(createArticleDto.title));
    const tags = await this.findOrCreateTags(createArticleDto.tagList || []);

    const article = this.articlesRepository.create({
      ...createArticleDto,
      slug,
      author,
      tags,
    });

    return this.articlesRepository.save(article);
  }

  async findAll(
    query: ArticleQueryDto,
    currentUserId?: number,
  ): Promise<{ articles: Article[]; articlesCount: number }> {
    const queryBuilder = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.tags', 'tags');

    const conditions: string[] = [];
    const params: any = {};

    if (query.tag) {
      queryBuilder.innerJoin('article.tags', 'filterTag');
      conditions.push('filterTag.name = :tag');
      params.tag = query.tag;
    }

    if (query.author) {
      conditions.push('author.username = :author');
      params.author = query.author;
    }

    if (query.favorited) {
      const favoritedUser = await this.usersRepository.findOne({
        where: { username: query.favorited },
      });
      if (favoritedUser) {
        queryBuilder
          .innerJoin('article.favorites', 'filterFavorite')
          .innerJoin('filterFavorite.user', 'favoritedUser')
          .andWhere('favoritedUser.id = :favoritedUserId', { favoritedUserId: favoritedUser.id });
      } else {
        // If user doesn't exist, return empty result
        return { articles: [], articlesCount: 0 };
      }
    }

    if (conditions.length > 0) {
      queryBuilder.where(conditions.join(' AND '), params);
    }

    // Get total count BEFORE applying pagination
    const totalCount = await queryBuilder.getCount();

    // Apply ordering and pagination
    queryBuilder
      .orderBy('article.createdAt', 'DESC')
      .addOrderBy('article.id', 'DESC') // Secondary sort for consistent ordering
      .take(query.limit || 20)
      .skip(query.offset || 0);

    const articles = await queryBuilder.getMany();

    // Load favorites for current user if authenticated and set favoritesCount
    const articleIds = articles.map((a) => a.id);
    
    if (articleIds.length > 0) {
      // Get favorites for current user if authenticated
      if (currentUserId) {
        const favorites = await this.favoritesRepository
          .createQueryBuilder('favorite')
          .innerJoin('favorite.article', 'article')
          .innerJoin('favorite.user', 'user')
          .where('article.id IN (:...articleIds)', { articleIds })
          .andWhere('user.id = :userId', { userId: currentUserId })
          .select(['favorite.id', 'article.id'])
          .getRawMany();
        const favoritedArticleIds = new Set(favorites.map((f) => f.article_id));
        articles.forEach((article) => {
          (article as any).favorited = favoritedArticleIds.has(article.id);
        });
      } else {
        articles.forEach((article) => {
          (article as any).favorited = false;
        });
      }

      // Get favoritesCount for all articles
      const favoritesCounts = await this.favoritesRepository
        .createQueryBuilder('favorite')
        .innerJoin('favorite.article', 'article')
        .select('article.id', 'articleId')
        .addSelect('COUNT(favorite.id)', 'count')
        .where('article.id IN (:...articleIds)', { articleIds })
        .groupBy('article.id')
        .getRawMany();

      const countMap = new Map(
        favoritesCounts.map((item) => [item.articleId, parseInt(item.count, 10)]),
      );

      articles.forEach((article) => {
        (article as any).favoritesCount = countMap.get(article.id) || 0;
      });
    } else {
      articles.forEach((article) => {
        (article as any).favorited = false;
        (article as any).favoritesCount = 0;
      });
    }

    return {
      articles,
      articlesCount: totalCount,
    };
  }

  async findFeed(
    currentUserId: number,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ articles: Article[]; articlesCount: number }> {
    // For now, return empty feed since we don't have follow functionality yet
    // TODO: Implement follow functionality and filter by followed users
    return { articles: [], articlesCount: 0 };
  }

  async findOneBySlug(slug: string, currentUserId?: number): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      relations: ['author', 'tags'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Check if favorited and get favoritesCount
    if (currentUserId) {
      const favorite = await this.favoritesRepository.findOne({
        where: {
          article: { id: article.id },
          user: { id: currentUserId },
        },
      });
      (article as any).favorited = !!favorite;
    } else {
      (article as any).favorited = false;
    }

    const favoritesCount = await this.favoritesRepository.count({
      where: { article: { id: article.id } },
    });
    (article as any).favoritesCount = favoritesCount;

    return article;
  }

  async update(
    slug: string,
    authorId: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      relations: ['author', 'tags'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.author.id !== authorId) {
      throw new ForbiddenException('You can only update your own articles');
    }

    if (updateArticleDto.title && updateArticleDto.title !== article.title) {
      const newSlug = await this.ensureSlugUnique(
        this.generateSlug(updateArticleDto.title),
        article.id,
      );
      article.slug = newSlug;
      article.title = updateArticleDto.title;
    }

    if (updateArticleDto.description !== undefined) {
      article.description = updateArticleDto.description;
    }

    if (updateArticleDto.body !== undefined) {
      article.body = updateArticleDto.body;
    }

    return this.articlesRepository.save(article);
  }

  async remove(slug: string, authorId: number): Promise<void> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.author.id !== authorId) {
      throw new ForbiddenException('You can only delete your own articles');
    }

    await this.articlesRepository.remove(article);
  }

  async favoriteArticle(slug: string, userId: number): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      relations: ['author', 'tags'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const existing = await this.favoritesRepository.findOne({
      where: {
        article: { id: article.id },
        user: { id: userId },
      },
    });

    if (!existing) {
      const favorite = this.favoritesRepository.create({
        article,
        user: { id: userId } as User,
      });
      await this.favoritesRepository.save(favorite);
    }

    return this.findOneBySlug(slug, userId);
  }

  async unfavoriteArticle(slug: string, userId: number): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const favorite = await this.favoritesRepository.findOne({
      where: {
        article: { id: article.id },
        user: { id: userId },
      },
    });

    if (favorite) {
      await this.favoritesRepository.remove(favorite);
    }

    return this.findOneBySlug(slug, userId);
  }

  formatArticleResponse(article: Article, includeBody: boolean = true): any {
    const author = article.author;
    return {
      article: {
        slug: article.slug,
        title: article.title,
        description: article.description,
        ...(includeBody && { body: article.body }),
        tagList: article.tags?.map((tag) => tag.name) || [],
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
        favorited: (article as any).favorited || false,
        favoritesCount: (article as any).favoritesCount || 0,
        author: {
          username: author.username,
          bio: author.bio ?? null,
          image: author.image ?? null,
          following: false, // TODO: Implement follow functionality
        },
      },
    };
  }

  formatArticlesResponse(articles: Article[], articlesCount?: number): any {
    return {
      articles: articles.map((article) => {
        const author = article.author;
        return {
          slug: article.slug,
          title: article.title,
          description: article.description,
          // body is NOT included in list view (performance optimization)
          tagList: article.tags?.map((tag) => tag.name) || [],
          createdAt: article.createdAt.toISOString(),
          updatedAt: article.updatedAt.toISOString(),
          favorited: (article as any).favorited || false,
          favoritesCount: (article as any).favoritesCount || 0,
          author: {
            username: author.username,
            bio: author.bio ?? null,
            image: author.image ?? null,
            following: false, // TODO: Implement follow functionality
          },
        };
      }),
      articlesCount: articlesCount !== undefined ? articlesCount : articles.length,
    };
  }
}

