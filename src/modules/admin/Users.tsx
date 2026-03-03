import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, User, Mail, Phone, Edit, Trash2, MoreVertical } from 'lucide-react';
import { getStatusColor, departments, userRoles } from '@/lib/utils';
import { useLogAuditAction, useNotification } from '@/core/hooks';

// temporary structure matching service output
// will be populated from backend via userService


const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: 'activ',
  });
  const [allRoles, setAllRoles] = useState<any[]>([]);

  const { user } = useAuth();
  const refreshPermissions = useRefreshPermissions();
  const { logAction } = useLogAuditAction();
  const { addNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { userService, roleService } = await import('@/core/services');

      if (editingUser) {
        // update user
        const updated = await userService.updateUser(editingUser.id, {
          email: formData.email,
          full_name: formData.name,
          phone: formData.phone,
          is_active: formData.status === 'activ',
        }, user?.id)
        if (updated) {
          // update role if changed
          if (formData.role && !editingUser.roles?.includes(formData.role)) {
            const roleObj = allRoles.find((r) => r.code === formData.role)
            if (roleObj) {
              await roleService.assignRoleToUser(
                editingUser.id,
                roleObj.id,
                user?.id
              )
            }
          }
          setUsers(
            users.map((u) =>
              u.id === editingUser.id ? { ...u, ...updated, roles: [formData.role] } : u
            )
          )
          await logAction(
            user?.id || '',
            'UPDATE',
            'users',
            editingUser.id,
            { newValue: updated }
          )
          addNotification('User updated successfully', 'success')
        }
      } else {
        // creating a user is beyond scope - just log and close
        // could call userService.createUser
        console.warn('Create user not implemented yet')
      }
    } catch (err) {
      console.error('Error saving user', err)
    } finally {
      setIsDialogOpen(false);
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        status: 'activ',
      });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department,
      status: user.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Ești sigur că vrei să ștergi acest angajat?')) {
      try {
        const { userService } = await import('@/core/services');
        const success = await userService.deactivateUser(id, user?.id)
        if (success) {
          setUsers(users.filter((u) => u.id !== id));
          await logAction(user?.id || '', 'DELETE', 'users', id)
          if (id === user?.id) {
            refreshPermissions()
          }
          addNotification('User deactivated', 'info')
        }
      } catch (err) {
        console.error('Error deactivating user', err);
      }
    }
  };

  const toggleStatus = async (id) => {
    try {
      const { userService } = await import('@/core/services');
      const userObj = users.find((u) => u.id === id)
      if (!userObj) return
      const active = userObj.status === 'activ'
      const success = active
        ? await userService.deactivateUser(id, user?.id)
        : await userService.activateUser(id, user?.id)
      if (success) {
        setUsers(
          users.map((u) =>
            u.id === id
              ? { ...u, status: active ? 'inactiv' : 'activ' }
              : u
          )
        )
        await logAction(
          user?.id || '',
          'UPDATE',
          'users',
          id,
          { description: active ? 'deactivated' : 'reactivated' }
        )
        if (id === user?.id) {
          refreshPermissions()
        }
      }
    } catch (err) {
      console.error('Error toggling status', err)
    }
  };

  const activeUsers = users.filter((u) => u.status === 'activ').length;
  const adminUsers = users.filter((u) => u.role === 'admin').length;
  const managerUsers = users.filter((u) => u.role === 'manager').length;

  // load users on mount
  React.useEffect(() => {
    const load = async () => {
      setLoadingUsers(true);
      try {
        const { userService } = await import('@/core/services/UserService');
        const { roleService } = await import('@/core/services/RoleService');

        // fetch all roles for select dropdown
        const roles = await roleService.getAllRoles();
        setAllRoles(roles);

        const res = await userService.getUsers();
        const fetched = res.data || [];
        // for each user fetch roles
        const withRoles = await Promise.all(
          fetched.map(async (u) => {
            const roles = await roleService.getUserRoles(u.id);
            return { ...u, roles: roles.map((r) => r.code) };
          })
        );
        setUsers(withRoles);
      } catch (err) {
        console.error('Error loading users', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Administrare</h1>
          <p className="text-gray-500">Gestionează angajații și permisiunile</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingUser(null);
            setFormData({
              name: '',
              email: '',
              phone: '',
              role: '',
              department: '',
              status: 'activ',
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Adaugă Angajat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Editează Angajat' : 'Angajat Nou'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser
                    ? 'Modifică informațiile angajatului.'
                    : 'Completează datele pentru a adăuga un nou angajat.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nume Complet</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Ion Popescu"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ion.popescu@rocket.ro"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+40 721 234 567"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează rolul" />
                      </SelectTrigger>
                      <SelectContent>
                        {userRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="department">Departament</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) =>
                        setFormData({ ...formData, department: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează dept." />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {editingUser && (
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează statusul" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activ">Activ</SelectItem>
                        <SelectItem value="inactiv">Inactiv</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Anulează
                </Button>
                <Button type="submit">
                  {editingUser ? 'Salvează' : 'Adaugă'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Angajați</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <User className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Administratori</p>
                <p className="text-2xl font-bold text-gray-900">{adminUsers}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <User className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Manageri</p>
                <p className="text-2xl font-bold text-gray-900">{managerUsers}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista Angajaților</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Angajat</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Departament</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.avatar}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="w-3 h-3" />
                        {user.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((roleCode) => {
                          const r = userRoles.find((r) => r.value === roleCode)
                          return (
                            <Badge
                              key={roleCode}
                              variant={
                                roleCode === 'admin'
                                  ? 'destructive'
                                  : roleCode === 'super_admin'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {r ? r.label : roleCode}
                            </Badge>
                          )
                        })
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {departments.find((d) => d.value === user.department)?.label ||
                      user.department}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusColor(user.status)}
                      variant="outline"
                    >
                      {user.status === 'activ' ? 'Activ' : 'Inactiv'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleStatus(user.id)}
                        className={
                          user.status === 'activ'
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }
                        title={user.status === 'activ' ? 'Inactivează' : 'Activează'}
                      >
                        {user.status === 'activ' ? '⊘' : '✓'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;