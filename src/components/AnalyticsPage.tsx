import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Brain, Clock, TrendingUp, Target, Timer, BarChart3 } from "lucide-react";
import type { StudyProgressData, DifficultyStats, TimeAnalyticsData } from "../../shared/schema";

export function AnalyticsPage() {
  const [view, setView] = useState<"progress" | "difficulty" | "time">("progress");

  const { data: progressData, isLoading: progressLoading } = useQuery<StudyProgressData>({
    queryKey: [`${import.meta.env.VITE_LINK_API}/api/analytics/progress`],
    enabled: view === "progress",
  });

  const { data: difficultyStats, isLoading: difficultyLoading } = useQuery<DifficultyStats>({
    queryKey: [`${import.meta.env.VITE_LINK_API}/api/analytics/stats`],
    enabled: view === "difficulty",
  });

  const { data: timeData, isLoading: timeLoading } = useQuery<TimeAnalyticsData>({
    queryKey: [`${import.meta.env.VITE_LINK_API}/api/analytics/time-data`],
    enabled: view === "time",
  });

  if (progressLoading || difficultyLoading || timeLoading) {
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

  const totalReviews = difficultyStats ? difficultyStats.easy + difficultyStats.medium + difficultyStats.difficult : 0;

  return (
    <div className="space-y-6" data-testid="analytics-page">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" data-testid="text-analytics-title">Analytics</h1>
        <div className="flex gap-2">
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
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card data-testid="card-total-sessions">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessões Totais</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-sessions">
                  {progressData.totalSessions}
                </div>
                <p className="text-xs text-muted-foreground">
                  sessões de estudo
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-study-time">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-study-time">
                  {Math.round(progressData.totalStudyTime / 60)}m
                </div>
                <p className="text-xs text-muted-foreground">
                  minutos estudados
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-average-session">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média por Sessão</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-average-session">
                  {Math.round(progressData.averageSessionTime / 60)}m
                </div>
                <p className="text-xs text-muted-foreground">
                  tempo médio
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-streak">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sequência</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-streak">
                  {progressData.streak}
                </div>
                <p className="text-xs text-muted-foreground">
                  dias consecutivos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Difficulty Breakdown */}
          <Card data-testid="card-difficulty-breakdown">
            <CardHeader>
              <CardTitle>Distribuição por Dificuldade</CardTitle>
              <CardDescription>
                Como você está se saindo com diferentes níveis de dificuldade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Fácil</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800" data-testid="badge-easy-count">
                    {progressData.difficultyBreakdown.easy}
                  </Badge>
                </div>
                <Progress 
                  value={(progressData.difficultyBreakdown.easy / Math.max(1, progressData.difficultyBreakdown.easy + progressData.difficultyBreakdown.medium + progressData.difficultyBreakdown.difficult)) * 100} 
                  className="h-2"
                  data-testid="progress-easy"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Médio</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800" data-testid="badge-medium-count">
                    {progressData.difficultyBreakdown.medium}
                  </Badge>
                </div>
                <Progress 
                  value={(progressData.difficultyBreakdown.medium / Math.max(1, progressData.difficultyBreakdown.easy + progressData.difficultyBreakdown.medium + progressData.difficultyBreakdown.difficult)) * 100} 
                  className="h-2"
                  data-testid="progress-medium"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Difícil</span>
                  <Badge variant="secondary" className="bg-red-100 text-red-800" data-testid="badge-difficult-count">
                    {progressData.difficultyBreakdown.difficult}
                  </Badge>
                </div>
                <Progress 
                  value={(progressData.difficultyBreakdown.difficult / Math.max(1, progressData.difficultyBreakdown.easy + progressData.difficultyBreakdown.medium + progressData.difficultyBreakdown.difficult)) * 100} 
                  className="h-2"
                  data-testid="progress-difficult"
                />
              </div>
            </CardContent>
          </Card>

          {/* Most Difficult Cards */}
          {progressData.mostDifficultCards.length > 0 && (
            <Card data-testid="card-difficult-cards">
              <CardHeader>
                <CardTitle>Cartões Mais Difíceis</CardTitle>
                <CardDescription>
                  Cartões que você mais tem dificuldade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {progressData.mostDifficultCards.map((item, index) => (
                    <div 
                      key={item.flashcard.id} 
                      className="flex justify-between items-start p-3 border rounded-lg"
                      data-testid={`card-difficult-item-${index}`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm" data-testid={`text-question-${index}`}>
                          {item.flashcard.question}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1" data-testid={`text-answer-${index}`}>
                          {item.flashcard.answer}
                        </p>
                      </div>
                      <Badge variant="destructive" data-testid={`badge-difficulty-count-${index}`}>
                        {item.difficultyCount}x
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {view === "difficulty" && difficultyStats && (
        <div className="space-y-6">
          <Card data-testid="card-difficulty-stats">
            <CardHeader>
              <CardTitle>Estatísticas de Dificuldade</CardTitle>
              <CardDescription>
                Análise detalhada das suas respostas por nível de dificuldade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-green-600" data-testid="text-easy-count">
                    {difficultyStats.easy}
                  </div>
                  <div className="text-sm text-muted-foreground">Fáceis</div>
                  <div className="text-xs text-muted-foreground">
                    {totalReviews > 0 ? Math.round((difficultyStats.easy / totalReviews) * 100) : 0}% do total
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-yellow-600" data-testid="text-medium-count">
                    {difficultyStats.medium}
                  </div>
                  <div className="text-sm text-muted-foreground">Médios</div>
                  <div className="text-xs text-muted-foreground">
                    {totalReviews > 0 ? Math.round((difficultyStats.medium / totalReviews) * 100) : 0}% do total
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-red-600" data-testid="text-difficult-count">
                    {difficultyStats.difficult}
                  </div>
                  <div className="text-sm text-muted-foreground">Difíceis</div>
                  <div className="text-xs text-muted-foreground">
                    {totalReviews > 0 ? Math.round((difficultyStats.difficult / totalReviews) * 100) : 0}% do total
                  </div>
                </div>
              </div>
              
              {totalReviews === 0 && (
                <div className="text-center text-muted-foreground mt-6" data-testid="text-no-reviews">
                  Nenhuma revisão registrada ainda. Comece estudando alguns flashcards!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {view === "time" && timeData && (
        <div className="space-y-6">
          {/* Time Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card data-testid="card-total-time">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-time">
                  {Math.round(timeData.totalTimeSpent / 60)}m
                </div>
                <p className="text-xs text-muted-foreground">
                  minutos estudando
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-average-time">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-average-time">
                  {Math.round(timeData.averageTimePerCard)}s
                </div>
                <p className="text-xs text-muted-foreground">
                  por flashcard
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-time-by-difficulty">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo por Dificuldade</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Fácil: {Math.round(timeData.timeByDifficulty.easy)}s</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Médio: {Math.round(timeData.timeByDifficulty.medium)}s</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Difícil: {Math.round(timeData.timeByDifficulty.difficult)}s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-cards-reviewed">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cartões Revisados</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-cards-reviewed">
                  {timeData.cardTimeDistribution.filter(c => c.totalReviews > 0).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  cartões únicos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Fastest Cards */}
          {timeData.fastestCards.length > 0 && (
            <Card data-testid="card-fastest-cards">
              <CardHeader>
                <CardTitle>Cartões Mais Rápidos</CardTitle>
                <CardDescription>
                  Os flashcards que você responde mais rapidamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeData.fastestCards.slice(0, 3).map((item, index) => (
                    <div 
                      key={item.flashcard.id} 
                      className="flex justify-between items-start p-3 border rounded-lg bg-green-50"
                      data-testid={`card-fast-item-${index}`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm" data-testid={`text-fast-question-${index}`}>
                          {item.flashcard.question}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1" data-testid={`text-fast-answer-${index}`}>
                          {item.flashcard.answer}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800" data-testid={`badge-fast-time-${index}`}>
                        {Math.round(item.averageTime)}s
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Slowest Cards */}
          {timeData.slowestCards.length > 0 && (
            <Card data-testid="card-slowest-cards">
              <CardHeader>
                <CardTitle>Cartões Mais Lentos</CardTitle>
                <CardDescription>
                  Os flashcards que levam mais tempo para responder
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeData.slowestCards.slice(0, 3).map((item, index) => (
                    <div 
                      key={item.flashcard.id} 
                      className="flex justify-between items-start p-3 border rounded-lg bg-red-50"
                      data-testid={`card-slow-item-${index}`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm" data-testid={`text-slow-question-${index}`}>
                          {item.flashcard.question}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1" data-testid={`text-slow-answer-${index}`}>
                          {item.flashcard.answer}
                        </p>
                      </div>
                      <Badge variant="destructive" data-testid={`badge-slow-time-${index}`}>
                        {Math.round(item.averageTime)}s
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}