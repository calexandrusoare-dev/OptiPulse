/**
 * OptiPulse HR - Time Entries Module
 * Track daily work hours and project assignments
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Send, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getStatusColor } from '@/lib/utils';

const projects = [
  { id: 1, name: 'Proiect Alpha', client: 'Client A' },
  { id: 2, name: 'Proiect Beta', client: 'Client B' },
  { id: 3, name: 'Dezvoltare Internă', client: 'Rocket' },
  { id: 4, name: 'Support Clienti', client: 'Various' },
];

const weekDays = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'];

const mockTimesheets = [
  {
    id: 1,
    weekStart: '2024-04-15',
    status: 'aprobat',
    totalHours: 40,
    entries: [
      { project: 'Proiect Alpha', hours: [8, 8, 8, 8, 8] },
      { project: 'Proiect Beta', hours: [0, 0, 0, 0, 0] },
      { project: 'Dezvoltare Internă', hours: [0, 0, 0, 0, 0] },
      { project: 'Support Clienti', hours: [0, 0, 0, 0, 0] },
    ],
  },
  {
    id: 2,
    weekStart: '2024-04-22',
    status: 'trimis',
    totalHours: 38,
    entries: [
      { project: 'Proiect Alpha', hours: [8, 8, 6, 8, 8] },
      { project: 'Proiect Beta', hours: [0, 0, 2, 0, 0] },
      { project: 'Dezvoltare Internă', hours: [0, 0, 0, 0, 0] },
      { project: 'Support Clienti', hours: [0, 0, 0, 0, 0] },
    ],
  },
  {
    id: 3,
    weekStart: '2024-04-29',
    status: 'draft',
    totalHours: 0,
    entries: [
      { project: 'Proiect Alpha', hours: [0, 0, 0, 0, 0] },
      { project: 'Proiect Beta', hours: [0, 0, 0, 0, 0] },
      { project: 'Dezvoltare Internă', hours: [0, 0, 0, 0, 0] },
      { project: 'Support Clienti', hours: [0, 0, 0, 0, 0] },
    ],
  },
];

const Timesheets = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [timesheetData, setTimesheetData] = useState({
    entries: projects.map((p) => ({
      project: p.name,
      hours: [0, 0, 0, 0, 0],
    })),
  });

  const [status, setStatus] = useState('draft');

  const handleHoursChange = (projectIndex, dayIndex, value) => {
    const newEntries = [...timesheetData.entries];
    newEntries[projectIndex].hours[dayIndex] = parseInt(value) || 0;
    setTimesheetData({ entries: newEntries });
  };

  const calculateTotal = () => {
    return timesheetData.entries.reduce(
      (total, entry) => total + entry.hours.reduce((a, b) => a + b, 0),
      0
    );
  };

  const handleSave = () => {
    setStatus('draft');
    console.log('Saved as draft:', timesheetData);
  };

  const handleSubmit = () => {
    setStatus('trimis');
    console.log('Submitted:', timesheetData);
  };

  const weekOffset = new Date();
  weekOffset.setDate(weekOffset.getDate() + currentWeek * 7);
  const weekStart = new Date(weekOffset);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Pontaje</h1>
          <p className="text-gray-500">Înregistrează orele lucrate</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(currentWeek - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">
            {weekStart.toLocaleDateString('ro-RO', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(currentWeek + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Ore Săptămâna</p>
            <p className="text-2xl font-bold text-gray-900">{calculateTotal()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Status</p>
            <Badge className={getStatusColor(status)} variant="outline">
              {status === 'draft' ? 'Draft' : status === 'trimis' ? 'Trimis' : status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Normă Săptămânală</p>
            <p className="text-2xl font-bold text-gray-900">40h</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="current">Săptămâna Curentă</TabsTrigger>
          <TabsTrigger value="history">Istoric</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pontaj Săptămânal</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    className="gap-2"
                    disabled={status === 'aprobat'}
                  >
                    <Save className="w-4 h-4" />
                    Salvare Draft
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="gap-2"
                    disabled={status === 'aprobat' || status === 'trimis'}
                  >
                    <Send className="w-4 h-4" />
                    Trimite
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-64">Proiect</TableHead>
                      {weekDays.map((day) => (
                        <TableHead key={day} className="text-center">
                          {day}
                        </TableHead>
                      ))}
                      <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timesheetData.entries.map((entry, projectIndex) => (
                      <TableRow key={entry.project}>
                        <TableCell className="font-medium">{entry.project}</TableCell>
                        {entry.hours.map((hours, dayIndex) => (
                          <TableCell key={dayIndex} className="text-center p-2">
                            <Input
                              type="number"
                              min="0"
                              max="24"
                              value={hours || ''}
                              onChange={(e) =>
                                handleHoursChange(
                                  projectIndex,
                                  dayIndex,
                                  e.target.value
                                )
                              }
                              className="w-16 h-10 text-center mx-auto"
                              disabled={status === 'aprobat'}
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">
                          {entry.hours.reduce((a, b) => a + b, 0)}h
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-50">
                      <TableCell className="font-bold">Total</TableCell>
                      {weekDays.map((_, dayIndex) => (
                        <TableCell key={dayIndex} className="text-center font-bold">
                          {timesheetData.entries.reduce(
                            (total, entry) => total + entry.hours[dayIndex],
                            0
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold text-primary">
                        {calculateTotal()}h
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Săptămâna</TableHead>
                    <TableHead>Total Ore</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Acțiiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTimesheets.map((ts) => (
                    <TableRow key={ts.id}>
                      <TableCell className="font-medium">
                        {new Date(ts.weekStart).toLocaleDateString('ro-RO', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </TableCell>
                      <TableCell>{ts.totalHours}h</TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(ts.status)}
                          variant="outline"
                        >
                          {ts.status.charAt(0).toUpperCase() + ts.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Vezi Detalii
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
              {showForm ? "Cancel" : "+ Log Time"}
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && canCreateEntry && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <h3>Log Time Entry</h3>
          <form onSubmit={handleCreate} className="login-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={formData.hours}
                  onChange={(e) =>
                    setFormData({ ...formData, hours: parseFloat(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Project</label>
              <select
                value={formData.project_id}
                onChange={(e) =>
                  setFormData({ ...formData, project_id: e.target.value })
                }
              >
                <option value="general">General Work</option>
                <option value="project-a">Project A</option>
                <option value="project-b">Project B</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="What did you work on?"
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Log Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: "20px",
            backgroundColor: "var(--primary-light)",
            borderRadius: "8px",
          }}
        >
          <strong>Total Hours (Last 30 Days):</strong> {getTotalHours().toFixed(1)}h
        </div>
      )}

      {loading && <div className="loading"></div>}

      {!loading && entries.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🕐</div>
          <h3 className="empty-state-title">No time entries</h3>
          <p className="empty-state-description">
            {canCreateEntry ? "Log your first time entry" : "No entries yet"}
          </p>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Project</th>
                <th>Hours</th>
                <th>Description</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{e.project_id}</td>
                  <td>
                    <strong>{e.hours}h</strong>
                  </td>
                  <td>{e.description || "-"}</td>
                  <td>{e.created_at ? new Date(e.created_at).toLocaleDateString() : "-"}</td>
                  <td>
                    {canEditEntry && (
                      <button
                        className="btn-danger btn-small"
                        onClick={() => handleDelete(e.id)}
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
      )}
    </div>
  )
}
