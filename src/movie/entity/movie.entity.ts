import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from './base-table.entity';
import { MovieDetail } from './movie-detail.entity';

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @OneToOne(() => MovieDetail)
  //   MovieDetail, (movieDetail) => movieDetail.id, {
  //   cascade: true,
  //   nullable: false,
  // }
  // )
  @JoinColumn()
  detail: MovieDetail;
}
