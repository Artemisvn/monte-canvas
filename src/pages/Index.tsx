import { LiveMarketDashboard } from '@/components/LiveMarketDashboard';
import { OptionsTrading } from '@/components/OptionsTrading';
import { BacktestingSimulator } from '@/components/BacktestingSimulator';
import { MLModelSimulator } from '@/components/MLModelSimulator';
import { RiskDashboard } from '@/components/RiskDashboard';
import { AlertSystem } from '@/components/AlertSystem';
import { ResearchNotebook } from '@/components/ResearchNotebook';
import { AdvancedChart } from '@/components/AdvancedChart';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, Zap } from 'lucide-react';

const Index = () => {
  return (
    <div className="space-y-6">
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
        <LiveMarketDashboard />
        <AdvancedChart />
        <OptionsTrading />
        <BacktestingSimulator />
        <MLModelSimulator />
        <RiskDashboard />
        <AlertSystem />
        <ResearchNotebook />
      </div>
    </div>
  );
};

export default Index;