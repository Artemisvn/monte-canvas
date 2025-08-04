import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, Zap } from 'lucide-react';

function App() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-muted/50 transition-colors" />
                <div className="flex items-center gap-3">
                  <div className="animate-fade-in">
                    <h1 className="text-xl font-bold text-foreground">QuantTrade Pro</h1>
                    <p className="text-sm text-muted-foreground">Institutional Trading Platform</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="animate-pulse">
                  <Activity className="h-3 w-3 mr-1" />
                  Live Data
                </Badge>
                <Badge variant="outline">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Market Open
                </Badge>
                <Badge variant="secondary">
                  <Zap className="h-3 w-3 mr-1" />
                  4 Strategies Active
                </Badge>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default App;