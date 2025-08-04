import { BacktestingSimulator } from '@/components/BacktestingSimulator';
import { MLModelSimulator } from '@/components/MLModelSimulator';
import { RiskDashboard } from '@/components/RiskDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Quantitative Trading Platform</h1>
          <p className="text-muted-foreground">Complete algorithmic trading and risk management suite</p>
        </div>
        
        <Tabs defaultValue="backtest" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="backtest">Backtesting</TabsTrigger>
            <TabsTrigger value="ml-models">ML Models</TabsTrigger>
            <TabsTrigger value="risk-management">Risk Management</TabsTrigger>
          </TabsList>

          <TabsContent value="backtest">
            <BacktestingSimulator />
          </TabsContent>

          <TabsContent value="ml-models">
            <MLModelSimulator />
          </TabsContent>

          <TabsContent value="risk-management">
            <RiskDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
