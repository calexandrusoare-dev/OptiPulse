/**
 * OptiPulse Finance - Expense Requests Module
 * Manage employee expense requests with RBAC
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Plus, Upload, Receipt, DollarSign, Filter, Download } from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

const mockExpenses = [
  {
    id: 1,
    employee: 'Maria Popescu',
    date: '2024-04-15',
    description: 'Călătorie business - Conferință Tech',
    amount: 450,
    category: 'transport',
    status: 'aprobat',
    receipt: true,
  },
  {
    id: 2,
    employee: 'Ion Ionescu',
    date: '2024-04-18',
    description: 'Hotel - 2 nopți',
    amount: 280,
    category: 'cazare',
    status: 'pending',
    receipt: true,
  },
  {
    id: 3,
    employee: 'Ana Georgescu',
    date: '2024-04-20',
    description: 'Software - Abonament lunar',
    amount: 99,
    category: 'software',
    status: 'respins',
    receipt: false,
  },
  {
    id: 4,
    employee: 'John Doe',
    date: '2024-04-22',
    description: 'Combustibil - Deplasare',
    amount: 85,
    category: 'transport',
    status: 'aprobat',
    receipt: true,
  },
  {
    id: 5,
    employee: 'Elena Dumitrescu',
    date: '2024-04-23',
    description: 'Cina - Întâlnire client',
    amount: 150,
    category: 'dieta',
    status: 'trimis',
    receipt: true,
  },
  {
    id: 6,
    employee: 'George Popa',
    date: '2024-04-25',
    description: 'Echipamente birou',
    amount: 320,
    category: 'echipamente',
    status: 'pending',
    receipt: true,
  },
];

const categories = [
  { value: 'transport', label: 'Transport' },
  { value: 'cazare', label: 'Cazare' },
  { value: 'dieta', label: 'Dietă' },
  { value: 'software', label: 'Software' },
  { value: 'echipamente', label: 'Echipamente' },
  { value: 'altele', label: 'Altele' },
];

const Expenses = () => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: '',
    receipt: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submit expense:', formData);
    setIsDialogOpen(false);
    setFormData({
      description: '',
      amount: '',
      category: '',
      date: '',
      receipt: null,
    });
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setFormData({ ...formData, receipt: file.name });
      }
    };
    input.click();
  };

  const totalPending = mockExpenses
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalApproved = mockExpenses
    .filter((e) => e.status === 'aprobat')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Deconturi</h1>
          <p className="text-gray-500">{t('expenseRequestsSubtitle')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Decont Nou
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Decont Nou</DialogTitle>
                <DialogDescription>
                  Completează detaliile pentru a depune un nou decont.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Descriere</Label>
                  <Input
                    id="description"
                    placeholder="Ex: Călătorie business"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Sumă (RON)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Upload Chitanță</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFileUpload}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {formData.receipt ? formData.receipt : 'Încarcă fișier'}
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Anulează
                </Button>
                <Button type="submit">Trimite Decontul</Button>
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
                <p className="text-sm text-gray-500">Total Aprobate</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalApproved)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">În Așteptare</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(totalPending)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <Receipt className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Deconturi Luna Curentă</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockExpenses.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Receipt className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtrează
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Angajat</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Descriere</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Sumă</TableHead>
                <TableHead>Chitanță</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.employee}</TableCell>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {expense.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {categories.find((c) => c.value === expense.category)
                        ?.label || expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>
                    {expense.receipt ? (
                      <Button variant="ghost" size="sm">
                        <Upload className="w-4 h-4 mr-1" />
                        Vezi
                      </Button>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusColor(expense.status)}
                      variant="outline"
                    >
                      {expense.status.charAt(0).toUpperCase() +
                        expense.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {expense.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="sm">
                            Aprobă
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            Respinge
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
};

export default Expenses;
