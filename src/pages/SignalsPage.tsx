import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, BarChart3 } from 'lucide-react';

const SignalsPage = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Signal Research</h1>
        <p className="text-muted-foreground mb-8">Alpha factor discovery and signal generation platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Active Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">127</div>
            <p className="text-sm text-muted-foreground">Currently monitoring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Signal Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">72.3%</div>
            <p className="text-sm text-muted-foreground">30-day average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Factor Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">45</div>
            <p className="text-sm text-muted-foreground">Alpha factors</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Signal Research Platform - Coming Soon</CardTitle>
          <CardDescription>
            Advanced alpha factor research, signal backtesting, and systematic strategy development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Zap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Signal research tools are in development</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignalsPage;