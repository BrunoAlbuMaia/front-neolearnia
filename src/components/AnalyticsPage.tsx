import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Brain, Clock, TrendingUp, Target, Timer, BarChart3 } from "lucide-react";
import { useAnalytics, type AnalyticsView } from "../hooks/useAnalytics";

export function AnalyticsPage() {
  const [view, setView] = useState<AnalyticsView>("progress");
  const { progressData, difficultyStats, timeData, isLoading } = useAnalytics(view);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalReviews = difficultyStats 
    ? difficultyStats.easy + difficultyStats.medium + difficultyStats.difficult 
    : 0;

  return (
    <div className="space-y-6" data-testid="analytics-page">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold" data-testid="text-analytics-title">Analytics</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={view === "progress" ? "default" : "outline"}
            onClick={() => setView("progress")}
            data-testid="button-view-progress"
          >
            <BarChart3 className="mr-1 h-4 w-4" /> Progresso
          </Button>
          <Button
            variant={view === "difficulty" ? "default" : "outline"}
            onClick={() => setView("difficulty")}
            data-testid="button-view-difficulty"
          >
            <Target className="mr-1 h-4 w-4" /> Dificuldades
          </Button>
          <Button
            variant={view === "time" ? "default" : "outline"}
            onClick={() => setView("time")}
            data-testid="button-view-time"
          >
            <Timer className="mr-1 h-4 w-4" /> Tempo
          </Button>
        </div>
      </div>

      {view === "progress" && progressData && (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="card-total-cards">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Cards</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-cards">
                  {progressData.totalCards}
                </div>
                <p className="text-xs text-muted-foreground">
                  Flashcards criados
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-studied-today">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estudados Hoje</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-studied-today">
                  {progressData.studiedToday}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cards revisados hoje
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-weekly-goal">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meta Semanal</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-weekly-goal">
                  {progressData.weeklyGoal}
                </div>
                <Progress 
                  value={(progressData.studiedToday / progressData.weeklyGoal) * 100} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card data-testid="card-current-streak">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sequência Atual</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-current-streak">
                  {progressData.currentStreak}
                </div>
                <p className="text-xs text-muted-foreground">
                  Dias consecutivos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {view === "difficulty" && difficultyStats && (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="card-total-reviews">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Revisões</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-reviews">
                  {totalReviews}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cards revisados
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-easy-reviews">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fáceis</CardTitle>
                <Badge className="bg-emerald-500">✓</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600" data-testid="text-easy-reviews">
                  {difficultyStats.easy}
                </div>
                <Progress 
                  value={totalReviews > 0 ? (difficultyStats.easy / totalReviews) * 100 : 0} 
                  className="mt-2 [&>*]:bg-emerald-500" 
                />
              </CardContent>
            </Card>

            <Card data-testid="card-medium-reviews">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Médios</CardTitle>
                <Badge className="bg-amber-500">~</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600" data-testid="text-medium-reviews">
                  {difficultyStats.medium}
                </div>
                <Progress 
                  value={totalReviews > 0 ? (difficultyStats.medium / totalReviews) * 100 : 0} 
                  className="mt-2 [&>*]:bg-amber-500" 
                />
              </CardContent>
            </Card>

            <Card data-testid="card-difficult-reviews">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Difíceis</CardTitle>
                <Badge variant="destructive">✗</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600" data-testid="text-difficult-reviews">
                  {difficultyStats.difficult}
                </div>
                <Progress 
                  value={totalReviews > 0 ? (difficultyStats.difficult / totalReviews) * 100 : 0} 
                  className="mt-2 [&>*]:bg-red-500" 
                />
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-difficulty-chart">
            <CardHeader>
              <CardTitle>Distribuição de Dificuldade</CardTitle>
              <CardDescription>
                Visualização da performance por nível de dificuldade
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">Fácil</div>
                  <Progress 
                    value={totalReviews > 0 ? (difficultyStats.easy / totalReviews) * 100 : 0} 
                    className="flex-1 [&>*]:bg-emerald-500" 
                  />
                  <div className="w-16 text-right text-sm text-muted-foreground">
                    {totalReviews > 0 ? Math.round((difficultyStats.easy / totalReviews) * 100) : 0}%
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">Médio</div>
                  <Progress 
                    value={totalReviews > 0 ? (difficultyStats.medium / totalReviews) * 100 : 0} 
                    className="flex-1 [&>*]:bg-amber-500" 
                  />
                  <div className="w-16 text-right text-sm text-muted-foreground">
                    {totalReviews > 0 ? Math.round((difficultyStats.medium / totalReviews) * 100) : 0}%
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">Difícil</div>
                  <Progress 
                    value={totalReviews > 0 ? (difficultyStats.difficult / totalReviews) * 100 : 0} 
                    className="flex-1 [&>*]:bg-red-500" 
                  />
                  <div className="w-16 text-right text-sm text-muted-foreground">
                    {totalReviews > 0 ? Math.round((difficultyStats.difficult / totalReviews) * 100) : 0}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {view === "time" && timeData && (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card data-testid="card-avg-study-time">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-avg-study-time">
                  {Math.round(timeData.averageStudyTime)}min
                </div>
                <p className="text-xs text-muted-foreground">
                  Por sessão de estudo
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-total-study-time">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-study-time">
                  {Math.round(timeData.totalStudyTime / 60)}h
                </div>
                <p className="text-xs text-muted-foreground">
                  De estudo acumulado
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-sessions-count">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessões</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-sessions-count">
                  {timeData.sessionsCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sessões completas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
