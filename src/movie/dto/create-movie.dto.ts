// import {
//   ArrayNotEmpty,
//   IsArray,
//   IsNotEmpty,
//   IsNumber,
//   IsString,
// } from 'class-validator';

export class CreateMovieDto {
  title: string;
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
