/**
 * Validates and parses a string ID to a positive integer
 * @param id - The string ID to validate and parse
 * @param fieldName - The name of the field for error messages (default: 'id')
 * @returns The parsed integer ID
 * @throws Error if the ID is invalid
 */
export function validateAndParseId(id: string, fieldName = 'id'): number {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || parsedId <= 0) {
    throw new Error(`Invalid ${fieldName} format: ${id}`);
  }
  return parsedId;
}

/**
 * Validates multiple string IDs and returns their parsed values
 * @param ids - Array of objects with id and optional fieldName
 * @returns Array of parsed integer IDs
 */
export function validateAndParseIds(
  ids: Array<{ id: string; fieldName?: string }>,
): number[] {
  return ids.map(({ id, fieldName = 'id' }) =>
    validateAndParseId(id, fieldName),
  );
}
