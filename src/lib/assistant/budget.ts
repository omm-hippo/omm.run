import { isCommandId } from "./catalog";
import type { ModelSelection } from "./types";

type D1ResultRow = Record<string, unknown>;

export interface D1StatementLike {
  bind(...values: unknown[]): D1StatementLike;
  first<T = D1ResultRow>(): Promise<T | null>;
  run(): Promise<unknown>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1StatementLike;
}

export interface AssistantStore {
  consume(bucket: string, limit: number, expiresAt: number, now: number): Promise<boolean>;
  getSelection(questionHash: string, now: number): Promise<ModelSelection | null>;
  putSelection(
    questionHash: string,
    selection: ModelSelection,
    expiresAt: number,
  ): Promise<void>;
}

const CONSUME_SQL = `
INSERT INTO assistant_budget (bucket, used, expires_at)
VALUES (?1, 1, ?2)
ON CONFLICT(bucket) DO UPDATE SET
  used = CASE
    WHEN assistant_budget.expires_at <= ?3 THEN 1
    ELSE assistant_budget.used + 1
  END,
  expires_at = ?2
WHERE assistant_budget.expires_at <= ?3 OR assistant_budget.used < ?4
RETURNING used
`;

const READ_CACHE_SQL = `
SELECT action, command_id
FROM assistant_selection_cache
WHERE question_hash = ?1 AND expires_at > ?2
`;

const WRITE_CACHE_SQL = `
INSERT INTO assistant_selection_cache (question_hash, action, command_id, expires_at)
VALUES (?1, ?2, ?3, ?4)
ON CONFLICT(question_hash) DO UPDATE SET
  action = excluded.action,
  command_id = excluded.command_id,
  expires_at = excluded.expires_at
`;

export class D1AssistantStore implements AssistantStore {
  constructor(private readonly database: D1DatabaseLike) {}

  async consume(
    bucket: string,
    limit: number,
    expiresAt: number,
    now: number,
  ): Promise<boolean> {
    const row = await this.database
      .prepare(CONSUME_SQL)
      .bind(bucket, expiresAt, now, limit)
      .first<{ used: number }>();
    return row !== null && typeof row.used === "number";
  }

  async getSelection(questionHash: string, now: number): Promise<ModelSelection | null> {
    const row = await this.database
      .prepare(READ_CACHE_SQL)
      .bind(questionHash, now)
      .first<{ action: unknown; command_id: unknown }>();

    if (!row) return null;
    if (row.action === "clarify" && row.command_id === null) {
      return { action: "clarify", commandId: null };
    }
    if (row.action === "command" && isCommandId(row.command_id)) {
      return { action: "command", commandId: row.command_id };
    }
    return null;
  }

  async putSelection(
    questionHash: string,
    selection: ModelSelection,
    expiresAt: number,
  ): Promise<void> {
    await this.database
      .prepare(WRITE_CACHE_SQL)
      .bind(questionHash, selection.action, selection.commandId, expiresAt)
      .run();
  }
}
