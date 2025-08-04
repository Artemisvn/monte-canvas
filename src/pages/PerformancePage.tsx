import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Target } from 'lucide-react';

const PerformancePage = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Performance Analytics</h1>
        <p className="text-muted-foreground mb-8">Track and analyze trading performance across all strategies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Total Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">+24.7%</div>
            <p className="text-sm text-muted-foreground">YTD Performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Sharpe Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1.84</div>
            <p className="text-sm text-muted-foreground">Risk-adjusted returns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">68.4%</div>
            <p className="text-sm text-muted-foreground">Successful trades</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Analytics - Coming Soon</CardTitle>
          <CardDescription>
            Detailed performance attribution, risk-adjusted metrics, and comparative analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Advanced performance analytics are being developed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformancePage;