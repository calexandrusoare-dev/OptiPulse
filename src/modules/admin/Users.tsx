/**
 * OptiPulse Admin - Users Management Module
 * User lifecycle and permission assignment with RBAC
 */

import { useEffect, useState } from "react"
import { useAuth } from "../../auth/AuthProvider"
import { supabase } from "../../api/supabaseClient"
import { canCreate, canEdit, canDelete } from "../../lib/rbac"
import { UserWithPermissions, UserPermission } from "../../types"

export default function Users() {
  const { permissions } = useAuth()
  const [users, setUsers] = useState<UserWithPermissions[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<
    string | null
  >(null)

  const moduleCode = "admin"
  const canCreateUser = canCreate(permissions, moduleCode)
  const canEditUser = canEdit(permissions, moduleCode)
  const canDeleteUser = canDelete(permissions, moduleCode)

  const [createFormData, setCreateFormData] = useState({
    email: "",
    password: "",
    full_name: "",
  })

  const [availablePermissions, setAvailablePermissions] = useState<
    {
      id: string
      module_code: string
      permission_code: string
      name: string
    }[]
  >([])

  /**
   * Load all users and their permissions
   */
  const loadUsers = async () => {
    try {
      setError(null)
      setLoading(true)

      // Get users from auth
      const { data: authUsers, error: authError } =
        await supabase.auth.admin.listUsers()

      if (authError) throw authError

      // Get permissions for each user
      const usersWithPermissions: UserWithPermissions[] = await Promise.all(
        authUsers.users.map(async (u) => {
          const { data: perms } = await supabase
            .from("v_user_permissions")
            .select("*")
            .eq("user_id", u.id)

          return {
            id: u.id,
            email: u.email || "",
            full_name: u.user_metadata?.full_name || "",
            permissions: (perms as UserPermission[]) || [],
            is_active: u.email_confirmed_at !== null,
          }
        })
      )

      setUsers(usersWithPermissions)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users")
      console.error("Load error:", err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load available permissions from database
   */
  const loadAvailablePermissions = async () => {
    try {
      // Query module_permission_definitions joined with modules and permissions
      const { data, error: err } = await supabase
        .from("module_permission_definitions")
        .select(
          `
          *,
          modules:module_id(code),
          permissions:permission_id(code, name)
        `
        )

      if (err) throw err

      const formattedPerms = (data || []).map((item: any) => ({
        id: `${item.module_id}-${item.permission_id}`,
        module_code: item.modules?.code || "",
        permission_code: item.permissions?.code || "",
        name: item.permissions?.name || "",
      }))

      setAvailablePermissions(formattedPerms)
    } catch (err) {
      console.error("Failed to load permissions:", err)
    }
  }

  useEffect(() => {
    loadUsers()
    loadAvailablePermissions()
  }, [])

  /**
   * Create new user
   */
  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!createFormData.email || !createFormData.password) {
      setError("Email and password are required")
      return
    }

    try {
      setError(null)
      setLoading(true)

      // Create auth user
      const { data, error: authError } = await supabase.auth.admin.createUser({
        email: createFormData.email,
        password: createFormData.password,
        user_metadata: {
          full_name: createFormData.full_name,
        },
        email_confirm: false,
      })

      if (authError) throw authError

      if (data.user) {
        // Link to business user table (if using)
        await supabase.from("users").insert({
          id: data.user.id,
          email: createFormData.email,
          full_name: createFormData.full_name,
          is_active: true,
        })
      }

      setCreateFormData({
        email: "",
        password: "",
        full_name: "",
      })
      setShowCreateForm(false)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user")
      console.error("Create error:", err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Grant permission to user
   */
  const handleGrantPermission = async (
    userId: string,
    moduleCode: string,
    permissionCode: string
  ) => {
    try {
      setError(null)

      // Get module and permission IDs
      const { data: modules } = await supabase
        .from("modules")
        .select("id")
        .eq("code", moduleCode)
        .single()

      const { data: perms } = await supabase
        .from("permissions")
        .select("id")
        .eq("code", permissionCode)
        .single()

      if (!modules || !perms) {
        throw new Error("Module or permission not found")
      }

      // Insert permission
      const { error: err } = await supabase
        .from("user_permissions")
        .insert({
          user_id: userId,
          module_id: modules.id,
          permission_id: perms.id,
        })

      if (err) throw err

      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to grant permission")
    }
  }

  /**
   * Revoke permission from user
   */
  const handleRevokePermission = async (
    userId: string,
    moduleCode: string,
    permissionCode: string
  ) => {
    try {
      setError(null)

      // Get module and permission IDs
      const { data: modules } = await supabase
        .from("modules")
        .select("id")
        .eq("code", moduleCode)
        .single()

      const { data: perms } = await supabase
        .from("permissions")
        .select("id")
        .eq("code", permissionCode)
        .single()

      if (!modules || !perms) {
        throw new Error("Module or permission not found")
      }

      // Delete permission
      const { error: err } = await supabase
        .from("user_permissions")
        .delete()
        .eq("user_id", userId)
        .eq("module_id", modules.id)
        .eq("permission_id", perms.id)

      if (err) throw err

      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke permission")
    }
  }

  /**
   * Delete user
   */
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return

    try {
      setError(null)

      const { error: err } = await supabase.auth.admin.deleteUser(userId)

      if (err) throw err

      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user")
    }
  }

  const userModules = Array.from(
    new Set(selectedUserForPermissions ? 
      users.find(u => u.id === selectedUserForPermissions)?.permissions.map(p => p.module_code) || [] :
      []
    )
  )

  return (
    <div>
      <div className="content-header">
        <h2 className="content-title">User Management</h2>
        <div className="content-actions">
          {canCreateUser && (
            <button
              className="btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? "Cancel" : "+ New User"}
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showCreateForm && canCreateUser && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <h3>Create New User</h3>
          <form onSubmit={handleCreateUser} className="login-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={createFormData.email}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={createFormData.password}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={createFormData.full_name}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    full_name: e.target.value,
                  })
                }
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="loading"></div>}

      {!loading && users.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3 className="empty-state-title">No users found</h3>
          <p className="empty-state-description">
            {canCreateUser ? "Create your first user" : "No users exist"}
          </p>
        </div>
      )}

      {!loading && users.length > 0 && (
        <>
          <div className="table-container" style={{ marginBottom: "20px" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Full Name</th>
                  <th>Status</th>
                  <th>Permissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.full_name || "-"}</td>
                    <td>
                      <span
                        className={`table-status ${
                          user.is_active ? "status-active" : "status-inactive"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-primary btn-small"
                        onClick={() =>
                          setSelectedUserForPermissions(
                            selectedUserForPermissions === user.id
                              ? null
                              : user.id
                          )
                        }
                      >
                        {user.permissions.length} permissions
                      </button>
                    </td>
                    <td>
                      {canDeleteUser && (
                        <button
                          className="btn-danger btn-small"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedUserForPermissions && canEditUser && (
            <div className="card">
              <h3>Manage Permissions</h3>
              <p style={{ marginBottom: "16px", color: "var(--gray-600)" }}>
                User: <strong>{users.find(u => u.id === selectedUserForPermissions)?.email}</strong>
              </p>

              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ marginBottom: "12px" }}>Available Permissions</h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {availablePermissions.map((perm) => {
                    const hasPermission = users
                      .find(u => u.id === selectedUserForPermissions)
                      ?.permissions.some(
                        (p) =>
                          p.module_code === perm.module_code &&
                          p.permission_code === perm.permission_code
                      )

                    return (
                      <div
                        key={perm.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "12px",
                          border: "1px solid var(--gray-200)",
                          borderRadius: "6px",
                          backgroundColor: hasPermission
                            ? "var(--primary-light)"
                            : "var(--gray-50)",
                        }}
                      >
                        <button
                          className={
                            hasPermission ? "btn-danger btn-small" : "btn-success btn-small"
                          }
                          onClick={() =>
                            hasPermission
                              ? handleRevokePermission(
                                  selectedUserForPermissions,
                                  perm.module_code,
                                  perm.permission_code
                                )
                              : handleGrantPermission(
                                  selectedUserForPermissions,
                                  perm.module_code,
                                  perm.permission_code
                                )
                          }
                          style={{ marginRight: "8px" }}
                        >
                          {hasPermission ? "✓" : "+"}
                        </button>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "600" }}>
                            {perm.module_code}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--gray-600)" }}>
                            {perm.permission_code}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}