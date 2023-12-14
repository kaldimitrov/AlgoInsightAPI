import { QueryConfig } from 'src/helpers/dto/query-config.type';

export const historyQueryConfig: QueryConfig = {
  language: {
    query: 'r.language = :language',
  },
  status: {
    query: 'r.status = :status',
  },
  min_cpu_usage: {
    query: 'r.max_cpu >= :min_cpu_usage',
  },
  max_cpu_usage: {
    query: 'r.max_cpu <= :max_cpu_usage',
  },
  min_memory_usage: {
    query: 'r.max_memory >= :min_memory_usage',
  },
  max_memory_usage: {
    query: 'r.max_memory <= :max_memory_usage',
  },
  min_execution_time: {
    query: 'r.execution_time >= :min_execution_time',
  },
  max_execution_time: {
    query: 'r.execution_time <= :max_execution_time',
  },
  date_start: {
    query: 'r.created_at >= :date_start',
  },
  date_end: {
    query: 'r.created_at <= :date_end ',
  },
  user_id: {
    query: 'r.user_id = :user_id',
  },
};
