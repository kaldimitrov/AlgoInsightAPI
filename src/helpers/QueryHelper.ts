import { SelectQueryBuilder } from 'typeorm';
import { QueryConfig } from './dto/query-config.type';

export default class QueryHelper {
  static paginateAndGetMany<T>(query: SelectQueryBuilder<T>, page: number = 1, pageSize: number = 10): Promise<T[]> {
    return query.skip(this.calculateSkip(page, pageSize)).take(pageSize).getMany();
  }

  static calculateSkip(page: number, pageSize: number): number {
    return (page - 1) * pageSize;
  }

  static applyFilters<T>(query: SelectQueryBuilder<T>, config: QueryConfig, filters): SelectQueryBuilder<T> {
    for (const [key, obj] of Object.entries(config)) {
      if (filters[key] || obj.default) {
        if (
          (obj.skipForValues && obj.skipForValues.some((value) => value === filters[key])) ||
          (obj.skipArray && Array.isArray(filters[key]))
        )
          continue;

        query.andWhere(obj.query, { [key]: filters[key] || obj.default });
      }
    }
    return query;
  }
}
