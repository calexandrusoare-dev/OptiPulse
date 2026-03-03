// backward compatibility layer
// re-export all types from the new centralized core/types module
export * from "@/core/types"

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
