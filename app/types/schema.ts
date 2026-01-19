/**
 * Schema property types matching backend BriefingPropertyType enum.
 */
export type SchemaPropertyType = 'string' | 'integer' | 'number' | 'boolean' | 'array' | 'object'

/**
 * Schema property formats matching backend BriefingPropertyFormat enum.
 */
export type SchemaPropertyFormat = 'date' | 'date-time' | 'email' | 'uri' | 'url'

/**
 * Represents a single property definition within a parameter schema.
 * Matches backend BriefingSchemaProperty DTO.
 */
export interface SchemaProperty {
  type: SchemaPropertyType
  description?: string
  format?: SchemaPropertyFormat
  enum?: readonly (string | number | boolean)[]
  items?: SchemaProperty
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  minItems?: number
  maxItems?: number
  default?: unknown
}

/**
 * Represents a complete parameter schema.
 * Matches backend BriefingSchema DTO.
 */
export interface ParameterSchema {
  type: 'object'
  properties: Record<string, SchemaProperty>
  required?: readonly string[]
}

/**
 * Type guard to check if a schema property has enum values.
 */
export function hasEnumValues(property: SchemaProperty): property is SchemaProperty & { enum: readonly (string | number | boolean)[] } {
  return property.enum !== undefined && property.enum.length > 0
}

/**
 * Type guard to check if a schema property is an array type.
 */
export function isArrayProperty(property: SchemaProperty): property is SchemaProperty & { items: SchemaProperty } {
  return property.type === 'array' && property.items !== undefined
}

/**
 * Get the default value for a schema property.
 */
export function getPropertyDefault(property: SchemaProperty): unknown {
  if (property.default !== undefined) {
    return property.default
  }

  switch (property.type) {
    case 'string':
      return ''
    case 'integer':
    case 'number':
      return null
    case 'boolean':
      return false
    case 'array':
      return []
    case 'object':
      return {}
    default:
      return null
  }
}

/**
 * Build initial form values from a parameter schema.
 */
export function buildInitialValues(schema: ParameterSchema): Record<string, unknown> {
  const values: Record<string, unknown> = {}

  for (const [key, property] of Object.entries(schema.properties)) {
    values[key] = getPropertyDefault(property)
  }

  return values
}
