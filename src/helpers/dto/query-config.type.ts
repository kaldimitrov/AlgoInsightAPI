export class QueryConfig {
  [key: string]: {
    query: string;
    default?: any;
    skipForValues?: any[];
    skipArray?: boolean;
  };
}
