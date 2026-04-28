import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Search, Trash2, ArrowRight, Activity, TrendingUp, Hash, Award } from "lucide-react";
import { motion } from "framer-motion";

import { useListSessions, useGetSessionStats, useDeleteSession, getListSessionsQueryKey, getGetSessionStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function History() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: sessions, isLoading: isSessionsLoading } = useListSessions();
  const { data: stats, isLoading: isStatsLoading } = useGetSessionStats();
  const deleteMutation = useDeleteSession();

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSessionStatsQueryKey() });
          toast({
            title: "Session deleted",
            description: "The session has been permanently removed.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete session.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const filteredSessions = sessions?.filter(s => 
    s.originalPrompt.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight">session_history</h1>
        <p className="text-muted-foreground mt-2">Review past optimization loops and their outcomes.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Sessions" 
          value={stats?.totalSessions || 0} 
          icon={<Hash className="h-4 w-4 text-muted-foreground" />} 
          loading={isStatsLoading} 
        />
        <StatCard 
          title="Avg Score" 
          value={stats?.averageFinalScore ? Math.round(stats.averageFinalScore) : 0} 
          icon={<Activity className="h-4 w-4 text-muted-foreground" />} 
          loading={isStatsLoading} 
        />
        <StatCard 
          title="Avg Improvement" 
          value={stats?.averageScoreImprovement ? `+${Math.round(stats.averageScoreImprovement)}` : 0} 
          icon={<TrendingUp className="h-4 w-4 text-green-500" />} 
          loading={isStatsLoading} 
        />
        <StatCard 
          title="Top Score" 
          value={stats?.topFinalScore || 0} 
          icon={<Award className="h-4 w-4 text-yellow-500" />} 
          loading={isStatsLoading} 
        />
      </div>

      {/* Search and List */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search original prompts..." 
            className="pl-9 bg-card border-border/50 font-mono text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isSessionsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full bg-card" />)}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-lg bg-card/30">
            <p className="text-muted-foreground">No sessions found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSessions.map((session, idx) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:border-primary/50 transition-colors bg-card/80 border-border/60">
                  <CardHeader className="pb-3 px-4 pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="font-mono text-[10px] bg-background">
                        {format(new Date(session.createdAt), "MMM d, HH:mm")}
                      </Badge>
                      <Badge variant="secondary" className="font-mono">
                        {session.finalScore}/100
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-mono line-clamp-2 leading-relaxed h-10">
                      {session.originalPrompt}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-2 flex-1">
                    <div className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                      <Activity className="h-3 w-3" />
                      {session.roundCount} Iterations
                    </div>
                  </CardContent>
                  <CardFooter className="px-4 pb-4 pt-2 flex justify-between">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete session?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this optimization session and all its rounds.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(session.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Link href={`/session/${session.id}`}>
                      <Button size="sm" variant="secondary" className="h-8 text-xs">
                        View Details
                        <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, loading }: { title: string, value: string | number, icon: React.ReactNode, loading: boolean }) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          {loading ? (
             <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold font-mono mt-1">{value}</p>
          )}
        </div>
        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
