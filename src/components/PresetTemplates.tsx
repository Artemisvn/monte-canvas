import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, Shield, Coins, Building2, Cpu, Gamepad2, Flame } from 'lucide-react';

interface SimulationParams {
  ticker: string;
  numSimulations: number;
  timeHorizon: number;
  expectedReturn?: number;
  volatility?: number;
}

interface PresetTemplatesProps {
  onLoadPreset: (preset: SimulationParams) => void;
}

interface PresetTemplate {
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  params: SimulationParams;
  category: string;
}

const presetTemplates: PresetTemplate[] = [
  // Conservative Templates
  {
    name: "Conservative Blue Chip",
    description: "Low volatility, steady returns - ideal for conservative investors",
    icon: Shield,
    color: "bg-blue-500",
    category: "Conservative",
    params: {
      ticker: "AAPL",
      numSimulations: 1000,
      timeHorizon: 252,
      expectedReturn: 0.10,
      volatility: 0.20
    }
  },
  {
    name: "Dividend Aristocrat",
    description: "Focus on stable dividend-paying stocks",
    icon: Building2,
    color: "bg-green-500",
    category: "Conservative",
    params: {
      ticker: "MSFT",
      numSimulations: 1500,
      timeHorizon: 504, // 2 years
      expectedReturn: 0.08,
      volatility: 0.18
    }
  },

  // Growth Templates
  {
    name: "Tech Growth",
    description: "High-growth technology stocks with higher volatility",
    icon: Cpu,
    color: "bg-purple-500",
    category: "Growth",
    params: {
      ticker: "NVDA",
      numSimulations: 2000,
      timeHorizon: 252,
      expectedReturn: 0.18,
      volatility: 0.45
    }
  },
  {
    name: "EV Revolution",
    description: "Electric vehicle sector with high growth potential",
    icon: Zap,
    color: "bg-emerald-500",
    category: "Growth",
    params: {
      ticker: "TSLA",
      numSimulations: 2500,
      timeHorizon: 126, // 6 months
      expectedReturn: 0.15,
      volatility: 0.50
    }
  },

  // Aggressive Templates
  {
    name: "Meme Stock Madness",
    description: "High-risk, high-reward social media driven stocks",
    icon: Flame,
    color: "bg-red-500",
    category: "Aggressive",
    params: {
      ticker: "GME",
      numSimulations: 5000,
      timeHorizon: 63, // 3 months
      expectedReturn: 0.25,
      volatility: 0.80
    }
  },
  {
    name: "Crypto Adjacent",
    description: "Stocks correlated with cryptocurrency trends",
    icon: Coins,
    color: "bg-orange-500",
    category: "Aggressive",
    params: {
      ticker: "COIN",
      numSimulations: 3000,
      timeHorizon: 126,
      expectedReturn: 0.20,
      volatility: 0.60
    }
  },

  // Market Index Templates
  {
    name: "S&P 500 Tracker",
    description: "Broad market exposure with moderate risk",
    icon: TrendingUp,
    color: "bg-indigo-500",
    category: "Index",
    params: {
      ticker: "SPY",
      numSimulations: 1000,
      timeHorizon: 252,
      expectedReturn: 0.10,
      volatility: 0.16
    }
  },
  {
    name: "NASDAQ 100",
    description: "Tech-heavy index for growth exposure",
    icon: Gamepad2,
    color: "bg-cyan-500",
    category: "Index",
    params: {
      ticker: "QQQ",
      numSimulations: 1500,
      timeHorizon: 252,
      expectedReturn: 0.12,
      volatility: 0.22
    }
  }
];

export const PresetTemplates: React.FC<PresetTemplatesProps> = ({ onLoadPreset }) => {
  const categories = [...new Set(presetTemplates.map(t => t.category))];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Zap className="h-4 w-4 mr-2" />
          Quick Start Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Simulation Templates</DialogTitle>
          <DialogDescription>
            Choose from pre-configured simulation scenarios based on different investment strategies and risk profiles.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{category}</h3>
                <Badge variant="secondary" className="text-xs">
                  {presetTemplates.filter(t => t.category === category).length} templates
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presetTemplates
                  .filter(template => template.category === category)
                  .map((template) => (
                    <Card 
                      key={template.name} 
                      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 border-l-4 border-l-transparent hover:border-l-primary"
                      onClick={() => onLoadPreset(template.params)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${template.color} text-white`}>
                              <template.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              <Badge variant="outline" className="text-xs mt-1">
                                {template.params.ticker}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">Simulations:</span>
                            <div className="font-medium">{template.params.numSimulations.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Time Horizon:</span>
                            <div className="font-medium">{template.params.timeHorizon} days</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Expected Return:</span>
                            <div className="font-medium text-green-600">
                              {((template.params.expectedReturn || 0) * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Volatility:</span>
                            <div className="font-medium text-orange-600">
                              {((template.params.volatility || 0) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground p-4 bg-muted/50 rounded-lg">
          <strong>Pro Tip:</strong> These templates provide starting points based on common investment strategies. 
          You can always modify the parameters after loading a template to suit your specific analysis needs.
        </div>
      </DialogContent>
    </Dialog>
  );
};