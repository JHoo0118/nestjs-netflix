// import {
//   ArrayNotEmpty,
//   IsArray,
//   IsNotEmpty,
//   IsNumber,
//   IsString,
// } from 'class-validator';

import { IsNotEmpty } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  genre: string;
  //   @IsNotEmpty()
  //   @IsString()
  //   title: string;

  //   @IsNotEmpty()
  //   @IsString()
  //   detail: string;

  //   @IsNotEmpty()
  //   @IsNumber()
  //   directorId: number;

  //   @IsArray()
  //   @ArrayNotEmpty()
  //   @IsNumber(
  //     {},
  //     {
  //       each: true,
  //     },
  //   )
  //   genreIds: number[];
}
