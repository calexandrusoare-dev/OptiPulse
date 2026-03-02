/**
 * OptiPulse Finance - Budgets Module
 * Department budget allocation and tracking
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Filter,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const budgetData = [
  {
    id: 1,
    department: 'IT',
    total: 120000,
    spent: 85420,
    forecast: 95000,
    manager: 'John Doe',
    categories: [
      { name: 'Hardware', spent: 35000, total: 40000 },
      { name: 'Software', spent: 22000, total: 30000 },
      { name: 'Servicii', spent: 18420, total: 30000 },
      { name: 'Training', spent: 10000, total: 20000 },
    ],
  },
  {
    id: 2,
    department: 'Marketing',
    total: 80000,
    spent: 52100,
    forecast: 65000,
    manager: 'Maria Popescu',
    categories: [
      { name: 'Publicitate', spent: 28000, total: 40000 },
      { name: 'Evenimente', spent: 12000, total: 20000 },
      { name: 'Materiale', spent: 8100, total: 15000 },
      { name: 'Agencii', spent: 4000, total: 5000 },
    ],
  },
  {
    id: 3,
    department: 'Sales',
    total: 100000,
    spent: 78500,
    forecast: 88000,
    manager: 'Ion Ionescu',
    categories: [
      { name: 'Comisioane', spent: 45000, total: 50000 },
      { name: 'Travel', spent: 18500, total: 25000 },
      { name: 'CRM', spent: 10000, total: 15000 },
      { name: 'Training', spent: 5000, total: 10000 },
    ],
  },
  {
    id: 4,
    department: 'HR',
    total: 50000,
    spent: 32400,
    forecast: 38000,
    manager: 'Elena Georgescu',
    categories: [
      { name: 'Recrutare', spent: 15000, total: 20000 },
      { name: 'Training', spent: 8400, total: 15000 },
      { name: 'Beneficii', spent: 6000, total: 10000 },
      { name: 'Evenimente', spent: 3000, total: 5000 },
    ],
  },
  {
    id: 5,
    department: 'Operațiuni',
    total: 90000,
    spent: 67800,
    forecast: 72000,
    manager: 'Ana Dumitrescu',
    categories: [
      { name: 'Utilități', spent: 25000, total: 30000 },
      { name: 'Mentenanță', spent: 22000, total: 25000 },
      { name: 'Logistică', spent: 15800, total: 25000 },
      { name: 'Asigurări', spent: 5000, total: 10000 },
    ],
  },
  {
    id: 6,
    department: 'Finanțe',
    total: 40000,
    spent: 18200,
    forecast: 22000,
    manager: 'George Popa',
    categories: [
      { name: 'Contabilitate', spent: 8000, total: 15000 },
      { name: 'Legal', spent: 6200, total: 10000 },
      { name: 'Bănci', spent: 3000, total: 5000 },
      { name: 'Audit', spent: 1000, total: 10000 },
    ],
  },
];

const Budgets = () => {
  const totalBudget = budgetData.reduce((sum, d) => sum + d.total, 0);
  const totalSpent = budgetData.reduce((sum, d) => sum + d.spent, 0);
  const totalForecast = budgetData.reduce((sum, d) => sum + d.forecast, 0);
  const overallPercentage = Math.round((totalSpent / totalBudget) * 100);

  const getStatusColor = (percentage) => {
    if (percentage > 90) return 'text-red-600';
    if (percentage > 75) return 'text-orange-500';
    return 'text-green-600';
  };

  const getProgressColor = (percentage) => {
    if (percentage > 90) return 'bg-red-600';
    if (percentage > 75) return 'bg-orange-500';
    return 'bg-primary';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Bugete Operaționale</h1>
          <p className="text-gray-500">Monitorizează și gestionează bugetele departamentelor</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtrează
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <Badge variant="success">Activ</Badge>
            </div>
            <p className="text-sm text-gray-500">Buget Total</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalBudget)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500">Total Cheltuit</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalSpent)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-orange-100">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500">Rămas</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalBudget - totalSpent)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-100">
                <TrendingDown className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500">Proiecție Final</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalForecast)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Buget Total vs. Cheltuit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {overallPercentage}% din buget utilizat
              </span>
              <span className={getStatusColor(overallPercentage)}>
                {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
              </span>
            </div>
            <Progress
              value={overallPercentage}
              className="h-4"
              indicatorClassName={getProgressColor(overallPercentage)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Department Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budgetData.map((dept) => {
          const percentage = Math.round((dept.spent / dept.total) * 100);
          return (
            <Card key={dept.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{dept.department}</CardTitle>
                  <Badge
                    className={percentage > 90 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                    variant="outline"
                  >
                    {percentage}% utilizat
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">Manager: {dept.manager}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(dept.spent)}
                      </p>
                      <p className="text-sm text-gray-500">
                        din {formatCurrency(dept.total)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={getStatusColor(percentage)}>
                        {formatCurrency(dept.total - dept.spent)} rămas
                      </p>
                    </div>
                  </div>

                  <Progress
                    value={percentage}
                    className="h-2"
                    indicatorClassName={getProgressColor(percentage)}
                  />

                  <div className="pt-2 space-y-2">
                    {dept.categories.map((cat) => {
                      const catPercentage = Math.round((cat.spent / cat.total) * 100);
                      return (
                        <div key={cat.name} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{cat.name}</span>
                            <span className="text-gray-500">
                              {formatCurrency(cat.spent)} / {formatCurrency(cat.total)}
                            </span>
                          </div>
                          <Progress
                            value={catPercentage}
                            className="h-1.5"
                            indicatorClassName={catPercentage > 90 ? 'bg-red-500' : 'bg-primary/60'}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Budgets;                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(percentageUsed, 100)}%`,
                        height: "100%",
                        backgroundColor: color,
                        transition: "width 0.2s ease",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      marginTop: "4px",
                      fontSize: "12px",
                      color: "var(--gray-600)",
                    }}
                  >
                    {percentageUsed.toFixed(1)}% used • ${budget.remaining_amount.toLocaleString()} remaining
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
