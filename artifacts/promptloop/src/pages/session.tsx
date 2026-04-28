import { useState } from "react";
import { useRoute, Link } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, Copy, Check, Sparkles, Code, FileText, Target, Users, Megaphone, ShieldAlert, Cpu } from "lucide-react";

import { useGetSession, getGetSessionQueryKey } from "@workspace/api-client-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SessionView() {
  const [, params] = useRoute("/session/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const { data: session, isLoading, isError } = useGetSession(id, { 
    query: { queryKey: getGetSessionQueryKey(id), enabled: !!id } 
  });

  const copyToClipboard = (text: string, cid: string) => {
    navigator.clipboard.writeText(text);
    setCopied(cid);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: "Copied",
      duration: 1500,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Session Not Found</h2>
        <p className="text-muted-foreground">The requested optimization session could not be loaded.</p>
        <Link href="/history">
          <Button variant="outline">Return to History</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/history">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono tracking-tight">session_{session.id}</h1>
            <Badge variant="outline" className="font-mono bg-background">
              {format(new Date(session.createdAt), "yyyy-MM-dd HH:mm")}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Context & Metadata */}
        <div className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wider font-mono text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Raw Prompt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0f0f13] p-3 rounded-md border border-border/30 text-sm font-mono text-gray-300 max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                {session.originalPrompt}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wider font-mono text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Goal</span>
                  <span className="font-medium">{session.goal || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Audience</span>
                  <span className="font-medium">{session.audience || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Tone</span>
                  <span className="font-medium">{session.tone || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Constraints</span>
                  <span className="font-medium">{session.constraints || "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-border/50">
             <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Final Quality Score</p>
                  <p className="text-3xl font-bold font-mono text-primary">{session.finalScore}<span className="text-lg text-muted-foreground">/100</span></p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Column: Results & Trace */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="final" className="w-full">
            <TabsList className="w-full bg-secondary/50 p-1 mb-4 grid grid-cols-2">
              <TabsTrigger value="final" className="font-mono text-xs">FINAL OUTPUT</TabsTrigger>
              <TabsTrigger value="trace" className="font-mono text-xs">OPTIMIZATION TRACE</TabsTrigger>
            </TabsList>
            
            <TabsContent value="final" className="m-0">
              <Card className="border-primary shadow-[0_0_30px_rgba(124,58,237,0.1)] overflow-hidden bg-card">
                <div className="bg-secondary/50 border-b border-border px-4 py-2 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold tracking-wider">COMPILED_PROMPT.md</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 text-xs font-mono text-muted-foreground hover:text-foreground"
                    onClick={() => copyToClipboard(session.finalPrompt, "final")}
                  >
                    {copied === "final" ? <Check className="h-3 w-3 mr-1.5 text-green-500" /> : <Copy className="h-3 w-3 mr-1.5" />}
                    COPY
                  </Button>
                </div>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px] w-full bg-[#0d0d12]">
                    <pre className="p-6 text-sm font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {session.finalPrompt}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trace" className="m-0 space-y-4">
              {session.rounds?.map((round, idx) => (
                <Card key={round.id} className="bg-card border-border/60 overflow-hidden">
                  <div className="flex items-center justify-between bg-secondary/30 px-4 py-2 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-xs font-bold uppercase">Iteration {round.round}</span>
                    </div>
                    <Badge variant="outline" className="font-mono bg-background">Score: {round.geminiScore}</Badge>
                  </div>
                  <CardContent className="p-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/40">
                    <div className="flex-1 p-4 bg-background/50">
                      <div className="mb-2 text-[10px] uppercase font-bold text-primary">Critique</div>
                      <p className="text-sm italic text-muted-foreground mb-4">
                        "{round.geminiCritique}"
                      </p>
                      <div className="mb-2 text-[10px] uppercase font-bold text-primary">Resolution</div>
                      <p className="text-sm">
                        {round.improvementSummary}
                      </p>
                    </div>
                    <div className="flex-1 p-4 relative group bg-[#0d0d12]">
                      <div className="mb-2 text-[10px] uppercase font-bold text-muted-foreground flex justify-between">
                        <span>Generated Prompt</span>
                        <button 
                          onClick={() => copyToClipboard(round.chatgptPrompt, `r-${round.id}`)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary/80"
                        >
                          {copied === `r-${round.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                      <ScrollArea className="h-[200px]">
                        <pre className="text-[11px] font-mono text-gray-400 whitespace-pre-wrap">
                          {round.chatgptPrompt}
                        </pre>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
