import { QueryConfig } from 'src/helpers/dto/query-config.type';

export const historyQueryConfig: QueryConfig = {
  language: {
    query: 'r.language = :language',
  },
  status: {
    query: 'r.status = :status',
  },
  date_start_value: {
    query: 'r.created_at >= :date_start_value',
  },
  date_end_value: {
    query: 'r.created_at <= :date_end_value',
  },
  card_suit: {
    query: 'r.card_suit = :card_suit',
  },
};
