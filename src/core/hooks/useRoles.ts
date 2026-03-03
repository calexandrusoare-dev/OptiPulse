/**
 * useRoles Hook
 * Custom hook for role management
 */

import { useEffect, useState, useCallback } from "react"
import { Role } from "@/core/types"
import { roleService } from "@/core/services"

/**
 * Hook to fetch and manage roles
 */
export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await roleService.getAllRoles()
      setRoles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch roles")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  return { roles, loading, error, refetch: fetchRoles }
}

/**
 * Hook to get specific role by ID
 */
export function useRole(roleId: string) {
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roleId) {
      setRole(null)
      return
    }

    const fetchRole = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await roleService.getRoleById(roleId)
        setRole(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch role")
      } finally {
        setLoading(false)
      }
    }

    fetchRole()
  }, [roleId])

  return { role, loading, error }
}

/**
 * Hook to get role by code
 */
export function useRoleByCode(roleCode: string) {
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roleCode) {
      setRole(null)
      return
    }

    const fetchRole = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await roleService.getRoleByCode(roleCode)
        setRole(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch role")
      } finally {
        setLoading(false)
      }
    }

    fetchRole()
  }, [roleCode])

  return { role, loading, error }
}

/**
 * Hook to manage role assignment
 */
export function useAssignRole() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const assignRole = useCallback(
    async (userId: string, roleId: string) => {
      try {
        setLoading(true)
        setError(null)
        const result = await roleService.assignRoleToUser(userId, roleId)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to assign role"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { assignRole, loading, error }
}

/**
 * Hook to manage role removal
 */
export function useRemoveRole() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const removeRole = useCallback(
    async (userId: string, roleId: string) => {
      try {
        setLoading(true)
        setError(null)
        const result = await roleService.removeRoleFromUser(userId, roleId)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to remove role"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { removeRole, loading, error }
}
