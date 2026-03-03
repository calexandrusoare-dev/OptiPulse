/**
 * OptiPulse - Dashboard Home Page
 * Welcome and quick navigation
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/auth/AuthProvider';
import { useDashboardStats, usePendingTasks } from '@/core/hooks';
import { useRecentActivity } from '@/core/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CalendarDays,
  Clock,
  Wallet,
  Receipt,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// NOTE: titles are translation keys, rendered with t()

// dashboard hooks


const Dashboard = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const stats = useDashboardStats(user?.id)
  const { logs: activity, loading: activityLoading } = useRecentActivity(10)
  const { tasks: pendingTasks, loading: tasksLoading } = usePendingTasks(5)

  // build cards array from stats
  const statsCards = [
    {
      title: 'vacationDaysRemaining',
      value: stats.vacationDaysRemaining,
      icon: CalendarDays,
      color: 'bg-rose-100 text-rose-600',
    },
    {
      title: 'weeklyHours',
      value: stats.weeklyHours,
      icon: Clock,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'monthlyBudgetLeft',
      value: stats.monthlyBudgetLeft,
      icon: Wallet,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'pendingExpenses',
      value: stats.pendingExpenses,
      icon: Receipt,
      color: 'bg-orange-100 text-orange-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
        <p className="text-gray-500">{t('dashboardSubtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t(stat.title)}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('recentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading && <p>Loading...</p>}
            {!activityLoading && (
              <div className="space-y-4">
                {activity.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {/* simple icon fallback */}
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{act.action}</p>
                      <p className="text-sm text-gray-500">{act.details}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(act.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              {t('pendingRequests')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasksLoading && <p>Loading...</p>}
            {!tasksLoading && (
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg border border-gray-100 hover:border-primary/20 hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-900 text-sm">{t(task.titleKey)}</p>
                      <Badge variant="warning">Nou</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{task.department}</span>
                      {task.requester && <span>· {task.requester}</span>}
                      {task.days && <span>· {task.days} zile</span>}
                      {task.amount && <span>· {task.amount}</span>}
                    </div>
                    <span>•</span>
                    <span>{task.requester}</span>
                  </div>
                  {task.days && (
                    <p className="text-xs text-primary mt-2">{task.days} zile</p>
                  )}
                  {task.amount && (
                    <p className="text-xs text-primary mt-2">{task.amount}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t('departmentBudgets')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { dept: 'IT', spent: 8500, total: 12000 },
              { dept: 'Marketing', spent: 4200, total: 8000 },
              { dept: 'Sales', spent: 6800, total: 10000 },
              { dept: 'HR', spent: 2100, total: 5000 },
              { dept: 'Operațiuni', spent: 5500, total: 9000 },
              { dept: 'Finanțe', spent: 1800, total: 4000 },
            ].map((budget) => {
              const percentage = Math.round((budget.spent / budget.total) * 100);
              return (
                <div key={budget.dept} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{budget.dept}</span>
                    <span className="text-sm text-gray-500">
                      {percentage}% utilizat
                    </span>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2"
                    indicatorClassName={
                      percentage > 90
                        ? 'bg-red-600'
                        : percentage > 70
                        ? 'bg-orange-500'
                        : 'bg-primary'
                    }
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>€{budget.spent.toLocaleString()}</span>
                    <span>€{budget.total.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
