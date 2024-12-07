/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseIntPipe,
  BadRequestException,
  Version,
  VERSION_NEUTRAL,
  Req,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/user/entity/user.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { UserId } from 'src/user/decorator/user-id.decorator';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { CacheInterceptor as CI } from '@nestjs/cache-manager';
import { Throttle } from 'src/common/decorator/throttle.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

// @Controller({
//   path: 'movie',
//   version: '2',
// })
// @UseInterceptors(ClassSerializerInterceptor)
// export class MovieControllerV2 {
//   @Get()
//   getMovies() {
//     return [];
//   }
// }
// @Controller({
//   path: 'movie',
//   // version: ['1', '3'],
//   // version: '1',
//   version: VERSION_NEUTRAL, // 기본 버전 설정, movie.module.ts에서 controllers: [MovieControllerV2, MovieController],로 Import 순서를 바꿔줘야 함
// })
@Controller('movie')
@ApiBearerAuth()
@ApiTags('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @Public()
  @Throttle({
    count: 5,
    unit: 'minute',
  })
  @ApiOperation({
    description: '[Movie]를 Pagination 하는 API',
  })
  @ApiResponse({
    status: 200,
    description: '성공적으로 API Pagination을 실행 했을때!',
  })
  @ApiResponse({
    status: 400,
    description: 'Pagination 데이터를 잘못 입력 했을때',
  })
  // @Version(['1', '3', '5'])
  getMovies(@Query() dto: GetMoviesDto, @UserId() userId?: number) {
    return this.movieService.findAll(dto, userId);
  }
  /// /movie/recent?sdfjiv
  @Get('recent')
  @UseInterceptors(CI)
  @CacheKey('getMoviesRecent')
  @CacheTTL(1000)
  getMoviesRecent() {
    return this.movieService.findRecent();
  }

  /// /movie/askdjfoixcv
  @Get(':id')
  @Public()
  getMovie(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory() {
          throw new BadRequestException('숫자를 입력해 주세요!');
        },
      }),
    )
    id: number,
    @Req() request: any,
  ) {
    const session = request.session;

    const movieCount = session.movieCount ?? {};

    request.session.movieCount = {
      ...movieCount,
      [id]: movieCount[id] ? movieCount[id] + 1 : 1,
    };

    return this.movieService.findOne(id);
  }

  @Post()
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  postMovie(
    @Body() body: CreateMovieDto,
    @QueryRunner() queryRunner: QR,
    @UserId() userId: number,
  ) {
    return this.movieService.create(body, userId, queryRunner);
  }

  @Patch(':id')
  @RBAC(Role.admin)
  patchMovie(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMovieDto,
  ) {
    return this.movieService.update(+id, body);
  }

  @Delete(':id')
  @RBAC(Role.admin)
  deleteMovie(@Param('id', ParseIntPipe) id: number) {
    this.movieService.remove(+id);
  }

  /**
   * [Like] [Dislike]
   *
   * 아무것도 누르지 않은 상태
   * Like & Dislike 모두 버튼 꺼져있음
   *
   * Like 버튼 누르면
   * Like 버튼 불 켜짐
   *
   * Like 버튼 다시 누르면
   * Like 버튼 불 꺼짐
   *
   * Dislike 버튼 누르면
   * Dislike 버튼 불 켜짐
   *
   * Dislike 버튼 다시 누르면
   * Dislike 버튼 불 꺼짐
   *
   * Like 버튼 누름
   * Like 버튼 불 켜짐
   *
   * Dislike 버튼 누름
   * Like 버튼 불 꺼지고 Dislike 버튼 불 켜짐
   */
  @Post(':id/like')
  createMovieLike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    return this.movieService.toggleMovieLike(movieId, userId, true);
  }

  @Post(':id/dislike')
  createMovieDislike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    return this.movieService.toggleMovieLike(movieId, userId, false);
  }
}
