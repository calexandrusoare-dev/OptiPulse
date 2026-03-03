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

export default function Permissions() {
  const { user } = useAuth();
  const { logAction } = useLogAuditAction();
  const { addNotification } = useNotification();

  const [perms, setPerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState<any>(null);
  const [formData, setFormData] = useState({ code: '', name: '', module_code: '', description: '' });

  const loadPerms = async () => {
    setLoading(true);
    try {
      const { permissionService } = await import('@/core/services');
      const data = await permissionService.getAllPermissions();
      setPerms(data);
    } catch (err) {
      console.error('Error loading permissions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerms();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { supabase } = await import('@/api/supabaseClient');
      if (editingPerm) {
        const { data, error } = await supabase
          .from('permissions')
          .update(formData)
          .eq('id', editingPerm.id)
          .select()
          .single();
        if (!error && data) {
          setPerms(perms.map((p) => (p.id === data.id ? data : p)));
          await logAction(user?.id || '', 'UPDATE', 'permissions', data.id, { newValue: data });
          addNotification('Permission updated', 'success');
        }
      } else {
        const { data, error } = await supabase
          .from('permissions')
          .insert(formData)
          .select()
          .single();
        if (!error && data) {
          setPerms([...perms, data]);
          await logAction(user?.id || '', 'CREATE', 'permissions', data.id, { newValue: data });
          addNotification('Permission created', 'success');
        }
      }
    } catch (err) {
      console.error('Error saving permission', err);
    } finally {
      setIsDialogOpen(false);
      setEditingPerm(null);
      setFormData({ code: '', name: '', module_code: '', description: '' });
    }
  };

  const handleEdit = (perm: any) => {
    setEditingPerm(perm);
    setFormData({
      code: perm.code,
      name: perm.name,
      module_code: perm.module_code,
      description: perm.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Ești sigur că vrei să dezactiva această permisiune?')) {
      try {
        const { supabase } = await import('@/api/supabaseClient');
        const { data, error } = await supabase
          .from('permissions')
          .update({ is_active: false })
          .eq('id', id);
        if (!error) {
          setPerms(perms.map((p) => (p.id === id ? { ...p, is_active: false } : p)));
          await logAction(user?.id || '', 'DELETE', 'permissions', id);
          addNotification('Permission deactivated', 'info');
        }
      } catch (err) {
        console.error('Error deactivating permission', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Permisiuni</h1>
          <p className="text-gray-500">Definește permisiuni globale</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => setIsDialogOpen(open)}>
          <DialogTrigger>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Adaugă Permisiune
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingPerm ? 'Editează Permisiune' : 'Permisiune Nouă'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Cod</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, code: e.target.value })}
                    required
                    disabled={!!editingPerm}
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
                  <Label htmlFor="module_code">Modul</Label>
                  <Input
                    id="module_code"
                    value={formData.module_code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, module_code: e.target.value })}
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
          <CardTitle>Listă Permisiuni</CardTitle>
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
                    <TableHead>Modul</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>A acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perms.map((p) => (
                    <TableRow key={p.id} className={!p.is_active ? 'opacity-50' : ''}>
                      <TableCell>{p.code}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.module_code}</TableCell>
                      <TableCell>{p.is_active ? 'Activ' : 'Inactiv'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
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
