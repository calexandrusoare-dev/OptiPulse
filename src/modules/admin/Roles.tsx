import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { useLogAuditAction, useNotification } from '@/core/hooks';

export default function Roles() {
  const { user } = useAuth();
  const { logAction } = useLogAuditAction();
  const { addNotification } = useNotification();

  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [formData, setFormData] = useState({ code: '', name: '', description: '' });
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const { roleService, permissionService } = await import('@/core/services');
      const data = await roleService.getAllRoles();
      setRoles(data);
      const perms = await permissionService.getAllPermissions();
      setAllPermissions(perms);
    } catch (err) {
      console.error('Error loading roles or permissions', err);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { roleService, permissionService } = await import('@/core/services');
      if (editingRole) {
        // update role fields
        const updated = await roleService.updateRole(editingRole.id, { ...formData, is_active: editingRole.is_active ?? true }, user?.id);
        if (updated) {
          // sync permissions
          const existingPerms = await permissionService.getRolePermissions(editingRole.id);
          const existingIds = existingPerms.map((p) => p.id);
          const toAdd = selectedPerms.filter((id) => !existingIds.includes(id));
          const toRemove = existingIds.filter((id) => !selectedPerms.includes(id));
          await Promise.all(
            toAdd.map((permId) => permissionService.assignPermissionToRole(editingRole.id, permId))
          );
          await Promise.all(
            toRemove.map((permId) => permissionService.removePermissionFromRole(editingRole.id, permId))
          );

          setRoles(roles.map((r) => (r.id === updated.id ? updated : r)));
          await logAction(user?.id || '', 'UPDATE', 'roles', updated.id, { newValue: updated });
          addNotification('Role updated', 'success');
        }
      } else {
        const created = await roleService.createRole({ ...formData, is_active: true }, user?.id);
        if (created) {
          // assign initial permissions
          await Promise.all(
            selectedPerms.map((permId) => permissionService.assignPermissionToRole(created.id, permId))
          );
          setRoles([...roles, created]);
          await logAction(user?.id || '', 'CREATE', 'roles', created.id, { newValue: created });
          addNotification('Role created', 'success');
        }
      }
    } catch (err) {
      console.error('Error saving role', err);
    } finally {
      setIsDialogOpen(false);
      setEditingRole(null);
      setFormData({ code: '', name: '', description: '' });
      setSelectedPerms([]);
    }
  };

  const handleEdit = async (role: any) => {
    setEditingRole(role);
    setFormData({ code: role.code, name: role.name, description: role.description || '' });
    // load assigned permissions
    try {
      const { permissionService } = await import('@/core/services');
      const perms = await permissionService.getRolePermissions(role.id);
      setSelectedPerms(perms.map((p) => p.id));
    } catch (err) {
      console.error('Error loading role permissions', err);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Ești sigur că vrei să dezactiva acest rol?')) {
      try {
        const { roleService } = await import('@/core/services');
        const success = await roleService.deleteRole(id, user?.id);
        if (success) {
          setRoles(roles.map((r) => (r.id === id ? { ...r, is_active: false } : r)));
          await logAction(user?.id || '', 'DELETE', 'roles', id);
          addNotification('Role deactivated', 'info');
        }
      } catch (err) {
        console.error('Error deleting role', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Roluri</h1>
          <p className="text-gray-500">Gestionați rolurile și permisiunile</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => setIsDialogOpen(open)}>
          <DialogTrigger>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Adaugă Rol
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingRole ? 'Editează Rol' : 'Rol Nou'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Cod</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, code: e.target.value })}
                    required
                    disabled={!!editingRole}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nume</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descriere</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* permissions list */}
                <div className="grid gap-2">
                  <Label>Permisiuni</Label>
                  <div className="max-h-48 overflow-auto border p-2 rounded">
                    {allPermissions.map((perm) => (
                      <label key={perm.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedPerms.includes(perm.id)}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setSelectedPerms((prev) =>
                              checked
                                ? [...prev, perm.id]
                                : prev.filter((id) => id !== perm.id)
                            )
                          }}
                        />
                        {perm.name} ({perm.module_code})
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="submit">Salvează</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listă Roluri</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading...</p>}
          {!loading && (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cod</TableHead>
                    <TableHead>Nume</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>A acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((r) => (
                    <TableRow key={r.id} className={!r.is_active ? 'opacity-50' : ''}>
                      <TableCell>{r.code}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.is_active ? 'Activ' : 'Inactiv'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(r)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
