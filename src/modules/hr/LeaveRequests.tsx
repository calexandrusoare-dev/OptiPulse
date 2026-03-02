/**
 * OptiPulse HR - Leave Requests Module
 * Manage leave request lifecycle with RBAC
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Plus, Calendar, List, Filter, Download } from 'lucide-react';
import { formatDate, getStatusColor, vacationTypes } from '@/lib/utils';

const mockVacations = [
  {
    id: 1,
    employee: 'Maria Popescu',
    startDate: '2024-04-15',
    endDate: '2024-04-19',
    type: 'odihna',
    status: 'aprobat',
    days: 5,
  },
  {
    id: 2,
    employee: 'Ion Ionescu',
    startDate: '2024-04-22',
    endDate: '2024-04-26',
    type: 'medical',
    status: 'pending',
    days: 5,
  },
  {
    id: 3,
    employee: 'Ana Georgescu',
    startDate: '2024-05-01',
    endDate: '2024-05-05',
    type: 'odihna',
    status: 'trimis',
    days: 5,
  },
  {
    id: 4,
    employee: 'John Doe',
    startDate: '2024-03-10',
    endDate: '2024-03-12',
    type: 'fara_plata',
    status: 'respins',
    days: 3,
  },
  {
    id: 5,
    employee: 'Elena Dumitrescu',
    startDate: '2024-06-01',
    endDate: '2024-06-15',
    type: 'odihna',
    status: 'aprobat',
    days: 15,
  },
];

const calendarEvents = [
  { date: '15-19 Aprilie', employee: 'Maria Popescu', type: 'odihna' },
  { date: '22-26 Aprilie', employee: 'Ion Ionescu', type: 'medical' },
  { date: '1-5 Mai', employee: 'Ana Georgescu', type: 'odihna' },
  { date: '1-15 Iunie', employee: 'Elena Dumitrescu', type: 'odihna' },
];

const Vacations = () => {
  const { t } = useTranslation()
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [vacationType, setVacationType] = useState('');
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submit vacation request:', { ...formData, vacationType });
    setIsDialogOpen(false);
    setFormData({ startDate: '', endDate: '' });
    setVacationType('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('concedii')}</h1>
          <p className="text-gray-500">{t('manageVacations')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Cerere Nouă
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Cerere Concediu Nou</DialogTitle>
                <DialogDescription>
                  Completează formularul pentru a solicita un nou concediu.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Tip Concediu</Label>
                  <Select value={vacationType} onValueChange={setVacationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează tipul" />
                    </SelectTrigger>
                    <SelectContent>
                      {vacationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Data Start</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">Data Sfârșit</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
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
                <Button type="submit">Trimite Cererea</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Zile Disponibile</p>
                <p className="text-2xl font-bold text-gray-900">20</p>
              </div>
              <Badge variant="info">Anual</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Zile Folosite</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <Badge variant="gray">2024</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cereri în Așteptare</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <Badge variant="warning">Pending</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cereri Aprobate</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
              <Badge variant="success">Aprobate</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" />
              Listă
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtrează
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        <TabsContent value="list" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Angajat</TableHead>
                    <TableHead>Perioadă</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Zile</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockVacations.map((vacation) => (
                    <TableRow key={vacation.id}>
                      <TableCell className="font-medium">
                        {vacation.employee}
                      </TableCell>
                      <TableCell>
                        {formatDate(vacation.startDate)} -{' '}
                        {formatDate(vacation.endDate)}
                      </TableCell>
                      <TableCell>
                        {vacationTypes.find((t) => t.value === vacation.type)
                          ?.label || vacation.type}
                      </TableCell>
                      <TableCell>{vacation.days}</TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(vacation.status)}
                          variant="outline"
                        >
                          {vacation.status.charAt(0).toUpperCase() +
                            vacation.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent>
              {/* placeholder calendar representation */}
              <p className="text-center text-gray-500">Calendar view coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Vacations;
