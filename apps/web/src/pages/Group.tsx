import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Group, Expense, UserBalance } from '@/types';

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadGroupData();
    }
  }, [id]);

  const loadGroupData = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const [groupResponse, expensesResponse, balancesResponse] = await Promise.all([
        apiService.getGroup(id),
        apiService.getGroupExpenses(id),
        apiService.getGroupBalances(id),
      ]);

      if (groupResponse.success && groupResponse.data) {
        setGroup(groupResponse.data);
      }

      if (expensesResponse.success && expensesResponse.data) {
        setExpenses(expensesResponse.data);
      }

      if (balancesResponse.success && balancesResponse.data) {
        setBalances(balancesResponse.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al cargar datos del grupo');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando grupo...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Grupo no encontrado</h2>
          <p className="text-gray-600 mb-4">El grupo que buscas no existe o no tienes acceso.</p>
          <Button onClick={() => navigate('/dashboard')}>Volver al Dashboard</Button>
        </div>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                {group.description && <p className="text-gray-600">{group.description}</p>}
              </div>
            </div>
            <Button onClick={() => navigate(`/groups/${id}/expenses/new`)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Gasto
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Miembros</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{group.members?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Personas en el grupo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalExpenses, group.currency)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {expenses.length} gastos registrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio por Persona</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    group.members?.length ? totalExpenses / group.members.length : 0,
                    group.currency
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Gasto promedio</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Balances */}
            <Card>
              <CardHeader>
                <CardTitle>Balances</CardTitle>
                <CardDescription>Saldos de cada miembro del grupo</CardDescription>
              </CardHeader>
              <CardContent>
                {balances.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay balances calculados aún</p>
                ) : (
                  <div className="space-y-4">
                    {balances.map(balance => (
                      <div key={balance.userId} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            {balance.user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{balance.user.name}</span>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-bold ${
                              balance.balance > 0
                                ? 'text-green-600'
                                : balance.balance < 0
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                            }`}
                          >
                            {formatCurrency(balance.balance, group.currency)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {balance.balance > 0
                              ? 'Le deben'
                              : balance.balance < 0
                                ? 'Debe'
                                : 'Equilibrado'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Gastos Recientes</CardTitle>
                <CardDescription>Últimos gastos registrados en el grupo</CardDescription>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No hay gastos registrados</p>
                    <Button onClick={() => navigate(`/groups/${id}/expenses/new`)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Primer Gasto
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expenses.slice(0, 5).map(expense => (
                      <div key={expense.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{expense.description}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(expense.date)}
                            <span className="mx-2">•</span>
                            Pagado por {expense.payer.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {formatCurrency(expense.amount, expense.currency)}
                          </div>
                          {expense.category && (
                            <div className="text-xs text-gray-500">{expense.category}</div>
                          )}
                        </div>
                      </div>
                    ))}
                    {expenses.length > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" size="sm">
                          Ver todos los gastos ({expenses.length})
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
