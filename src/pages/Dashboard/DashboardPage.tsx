import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import {
  useDashboardOverview,
  useDashboardActivity,
  useDashboardDifficulty,
  useDashboardReviewSchedule,
} from "../../hooks/useDashboard";
import { Spinner } from "../../components/ui/spinner";
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Award,
  Calendar,
  Target,
  AlertCircle,
  BarChart3
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  easy: "#10B981", // Verde
  medium: "#F59E0B", // Laranja
  difficult: "#EF4444", // Vermelho
};

// Cores para o gráfico de pizza
const PIE_COLORS = [COLORS.easy, COLORS.medium, COLORS.difficult];

export function DashboardPage() {
  const { data: overview, isLoading: loadingOverview } = useDashboardOverview();
  const { data: activity, isLoading: loadingActivity } = useDashboardActivity();
  const { data: difficulty, isLoading: loadingDifficulty } = useDashboardDifficulty();
  const { data: reviewSchedule, isLoading: loadingReviewSchedule } = useDashboardReviewSchedule();

  const isLoading = loadingOverview || loadingActivity || loadingDifficulty || loadingReviewSchedule;

  // Preparar dados para gráfico de pizza
  const difficultyData = difficulty
    ? [
        { name: "Fácil", value: difficulty.easy },
        { name: "Médio", value: difficulty.medium },
        { name: "Difícil", value: difficulty.difficult },
      ]
    : [];

  // Formatar atividade para o gráfico de linha (últimos 30 dias)
  const activityChartData = activity
    ? activity.map((item) => ({
        day: new Date(item.day).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        sessions: item.sessions,
      }))
    : [];

  // Dados para gráfico de barras (revisões)
  const reviewData = reviewSchedule
    ? [
        {
          name: "Devidas Hoje",
          value: reviewSchedule.due_today,
        },
        {
          name: "Atrasadas",
          value: reviewSchedule.overdue,
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" text="Carregando dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu progresso e estatísticas de estudo
          </p>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de Sessões */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.total_sessions || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Sessões de estudo realizadas
              </p>
            </CardContent>
          </Card>

          {/* Total de Cards Estudados */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cards Estudados</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.total_cards_studied || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de flashcards revisados
              </p>
            </CardContent>
          </Card>

          {/* Total de XP */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de XP</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.total_xp || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pontos de experiência acumulados
              </p>
            </CardContent>
          </Card>

          {/* Duração Média */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview?.avg_session_duration
                  ? `${Math.round(overview.avg_session_duration)} min`
                  : "0 min"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tempo médio por sessão
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Linha - Atividade */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Atividade (Últimos 30 dias)
              </CardTitle>
              <CardDescription>
                Número de sessões por dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Sessões"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Pizza - Dificuldade */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Distribuição de Dificuldade
              </CardTitle>
              <CardDescription>
                Cards por nível de dificuldade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Barras - Revisões */}
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Revisões Pendentes
              </CardTitle>
              <CardDescription>
                Cards para revisar e ease factor médio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={reviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3B82F6" name="Quantidade" />
                  </BarChart>
                </ResponsiveContainer>
                
                {/* Ease Factor Médio */}
                {reviewSchedule && (
                  <div className="flex items-center justify-center gap-2 pt-4 border-t">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Ease Factor Médio:{" "}
                      <span className="font-semibold text-foreground">
                        {reviewSchedule.avg_ease_factor.toFixed(2)}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

