import { useState } from 'react';
import { BacktestingSimulator } from '@/components/BacktestingSimulator';
import { MLModelSimulator } from '@/components/MLModelSimulator';
import { RiskDashboard } from '@/components/RiskDashboard';
import { LiveMarketDashboard } from '@/components/LiveMarketDashboard';
import { AlertSystem } from '@/components/AlertSystem';
import { ResearchNotebook } from '@/components/ResearchNotebook';
import { OptionsTrading } from '@/components/OptionsTrading';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, Zap } from 'lucide-react';

const Index = () => {
  const [activeSection, setActiveSection] = useState('market');
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-muted/50 transition-colors" />
                <div className="flex items-center gap-3">
                  <div className="animate-fade-in">
                    <h1 className="text-xl font-bold text-foreground">Trading Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Real-time algorithmic trading platform</p>
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
            <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-card/50 backdrop-blur border border-border/50 rounded-lg p-4 hover:bg-card/70 transition-all duration-200 hover-scale">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Portfolio Value</p>
                      <p className="text-2xl font-bold text-primary">$125,432</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-success" />
                  </div>
                  <p className="text-xs text-success mt-1">+2.34% today</p>
                </div>
                
                <div className="bg-card/50 backdrop-blur border border-border/50 rounded-lg p-4 hover:bg-card/70 transition-all duration-200 hover-scale">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Positions</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <Activity className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">3 new signals</p>
                </div>
                
                <div className="bg-card/50 backdrop-blur border border-border/50 rounded-lg p-4 hover:bg-card/70 transition-all duration-200 hover-scale">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                      <p className="text-2xl font-bold text-success">68.4%</p>
                    </div>
                    <Zap className="h-8 w-8 text-success" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                </div>
                
                <div className="bg-card/50 backdrop-blur border border-border/50 rounded-lg p-4 hover:bg-card/70 transition-all duration-200 hover-scale">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                      <p className="text-2xl font-bold">1.84</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-xs text-success mt-1">Above benchmark</p>
                </div>
              </div>

              {/* Main Dashboard Content */}
              <div className="space-y-8">
                {activeSection === 'market' && <LiveMarketDashboard />}
                {activeSection === 'options' && <OptionsTrading />}
                {activeSection === 'backtest' && <BacktestingSimulator />}
                {activeSection === 'ml-models' && <MLModelSimulator />}
                {activeSection === 'risk-management' && <RiskDashboard />}
                {activeSection === 'alerts' && <AlertSystem />}
                {activeSection === 'research' && <ResearchNotebook />}
                
                {/* Show all by default for demonstration */}
                {activeSection === 'market' && (
                  <div className="space-y-8">
                    <OptionsTrading />
                    <BacktestingSimulator />
                    <MLModelSimulator />
                    <RiskDashboard />
                    <AlertSystem />
                    <ResearchNotebook />
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
