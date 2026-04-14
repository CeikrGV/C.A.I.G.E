type MaybeWrapped<T> = T | { data?: T };

export function unwrapData<T>(value: MaybeWrapped<T> | null | undefined): T | null {
  if (value == null) return null;
  if (typeof value === "object" && "data" in (value as Record<string, unknown>)) {
    return ((value as { data?: T }).data ?? null) as T | null;
  }
  return value as T;
}

export function unwrapArray<T>(
  value: unknown,
  namedKey?: string,
): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== "object") return [];

  const record = value as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data as T[];
  if (namedKey && Array.isArray(record[namedKey])) return record[namedKey] as T[];

  return [];
}
