import { COMMAND_ORDER, type Slug } from "../../i18n/commands/base";

export function isCommandId(value: unknown): value is Slug {
  return (
    typeof value === "string" &&
    (COMMAND_ORDER as readonly string[]).includes(value)
  );
}
