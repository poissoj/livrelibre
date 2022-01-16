export function isIn<P extends PropertyKey, K extends P>(
  target: Record<K, unknown>,
  property: P
): property is K {
  return property in target;
}

export const isDefined = <Elt>(elt: Elt): elt is NonNullable<Elt> =>
  elt !== null && elt !== undefined;

// Remove diacritics
export const norm = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
