import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  detail: string;

  @IsNotEmpty()
  @IsNumber()
  directorId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber(
    {},
    {
      each: true,
    },
  )
  @Type(() => Number)
  genreIds: number[];

  @IsString()
  // @ApiProperty({
  //     description: '영화 파일 이름',
  //     example: 'aaa-bbb-ccc-ddd.jpg'
  // })
  movieFileName: string;
}
