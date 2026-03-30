/**
 * Shared utility types used across all domains.
 */
export declare namespace _Utilities {
  /** Extracts a union of all values from an object type (like Object.values at the type level) */
  export type ValuesOfObject<ObjectType> = ObjectType[keyof ObjectType]
}
