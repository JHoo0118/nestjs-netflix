/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { PagePaginationDto } from './dto/page-pagination.dto';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';

@Injectable()
export class CommonService {
  constructor() {}

  applyPagePaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: PagePaginationDto,
  ) {
    const { page, take } = dto;

    const skip = (page - 1) * take;

    qb.take(take);
    qb.skip(skip);
  }

  async applyCursorPaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPaginationDto,
  ) {
    let { cursor, take, order, isPreviousPage } = dto;

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');

      /**
       * {
       *  values : {
       *      id: 27
       *  },
       *  order: ['id_DESC']
       * }
       */
      const cursorObj = JSON.parse(decodedCursor);

      order = cursorObj.order;

      const { values } = cursorObj;

      /// WHERE (column1 > value1)
      /// OR      (column1 = value1 AND column2 < value2)
      /// OR      (column1 = value1 AND column2 = value2 AND column3 > value3)
      /// (movie.column1, movie.column2, movie.column3) > (:value1, :value2, :value3)

      const columns = Object.keys(values);

      let whereClause = '';
      const whereParams = {};

      columns.forEach((column, index) => {
        const comparisonOperator = order[index].endsWith('DESC') ? '<' : '>';
        let condition = `(${columns
          .slice(0, index + 1)
          .map((col, i) =>
            i === index
              ? `${qb.alias}.${col} ${comparisonOperator} :${col}`
              : `${qb.alias}.${col} = :${col}`,
          )
          .join(' AND ')})`;

        whereClause += index === 0 ? condition : ` OR ${condition}`;

        // whereParams에 현재 컬럼의 값을 추가
        whereParams[column] = values[column];
      });
      // 최종적으로 qb.where에 whereClause와 whereParams를 전달
      qb.where(whereClause, whereParams);
    }

    for (let i = 0; i < order.length; i++) {
      const [column, direction] = order[i].split('_');

      if (direction !== 'ASC' && direction !== 'DESC') {
        throw new BadRequestException(
          'Order는 ASC 또는 DESC으로 입력해주세요!',
        );
      }

      if (i === 0) {
        qb.orderBy(`${qb.alias}.${column}`, direction);
      } else {
        qb.addOrderBy(`${qb.alias}.${column}`, direction);
      }
    }

    qb.take(take);

    const results = await qb.getMany();

    let nextCursor = this.generateNextCursor(results, order);
    let previousCursor = this.generatePreviousCursor(results, order);

    // dto의 isPreviousPage에 따라 커서 이름을 자동으로 바꿈
    if (isPreviousPage) {
      [nextCursor, previousCursor] = [previousCursor, nextCursor];
    }

    return { qb, nextCursor, previousCursor };
  }

  generateNextCursor<T>(results: T[], order: string[]): string | null {
    if (results.length === 0) return null;

    /**
     * {
     *  values : {
     *      id: 27
     *  },
     *  order: ['id_DESC']
     * }
     */

    const lastItme = results[results.length - 1];

    const values = {};

    order.forEach((columnOrder) => {
      const [column] = columnOrder.split('_');
      values[column] = lastItme[column];
    });

    const cursorObj = { values, order };
    const nextCursor = Buffer.from(JSON.stringify(cursorObj)).toString(
      'base64',
    );

    return nextCursor;
  }

  generatePreviousCursor<T>(results: T[], order: string[]): string | null {
    if (results.length === 0) return null;

    const firstItem = results[0];

    const values = {};

    const reversedOrder = order.map((columnOrder) => {
      const [column, direction] = columnOrder.split('_');
      const reversedDirection = direction === 'ASC' ? 'DESC' : 'ASC';
      return `${column}_${reversedDirection}`;
    });

    reversedOrder.forEach((columnOrder) => {
      const [column] = columnOrder.split('_');
      values[column] = firstItem[column];
    });

    const cursorObj = { values, order: reversedOrder };
    const previousCursor = Buffer.from(JSON.stringify(cursorObj)).toString(
      'base64',
    );

    return previousCursor;
  }
}
