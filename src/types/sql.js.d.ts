declare module "sql.js" {
  export type SqlValue = number | string | Uint8Array | null;
  export type ParamsObject = Record<string, SqlValue>;
  export type BindParams = SqlValue[] | ParamsObject | unknown[];

  export class Statement {
    bind(params?: BindParams): boolean;
    step(): boolean;
    get(params?: BindParams): SqlValue[];
    getAsObject(params?: BindParams): ParamsObject;
    run(params?: BindParams): void;
    reset(): void;
    free(): boolean;
  }

  export class Database {
    constructor(data?: ArrayLike<number> | Buffer | null);
    exec(sql: string): unknown[];
    prepare(sql: string): Statement;
    run(sql: string, params?: BindParams): Database;
    export(): Uint8Array;
    close(): void;
  }

  export interface SqlJsStatic {
    Database: typeof Database;
  }

  export interface InitSqlJsConfig {
    locateFile?: (file: string) => string;
    wasmBinary?: ArrayBuffer | Uint8Array | Buffer;
  }

  export default function initSqlJs(
    config?: InitSqlJsConfig,
  ): Promise<SqlJsStatic>;
}
