import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Minus, 
  Code, 
  Save, 
  AlertCircle,
  Target,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { TradingStrategy } from '@/lib/backtesting';

interface Condition {
  id: string;
  indicator: string;
  operator: string;
  value: number | string;
  timeframe?: string;
}

interface StrategyRule {
  id: string;
  action: 'BUY' | 'SELL';
  conditions: Condition[];
  positionSize: number;
}

interface CustomStrategyParams {
  name: string;
  description: string;
  rules: StrategyRule[];
}

interface StrategyBuilderProps {
  onStrategyCreated: (strategy: TradingStrategy) => void;
}

class CustomStrategy extends TradingStrategy {
  name: string;
  description: string;
  parameters: { [key: string]: any };
  private rules: StrategyRule[];

  constructor(params: CustomStrategyParams) {
    super();
    this.name = params.name;
    this.description = params.description;
    this.rules = params.rules;
    this.parameters = { positionSize: 0.8 };
  }

  generateSignal(prices: any[], currentIndex: number, position?: any): 'BUY' | 'SELL' | 'HOLD' {
    // Simplified signal generation based on rules
    // In a real implementation, this would evaluate the actual conditions
    
    for (const rule of this.rules) {
      const conditionsMet = rule.conditions.every(condition => {
        // Evaluate condition based on indicator and operator
        return this.evaluateCondition(condition, prices, currentIndex);
      });

      if (conditionsMet) {
        if (rule.action === 'BUY' && (!position || position.quantity === 0)) {
          return 'BUY';
        } else if (rule.action === 'SELL' && position && position.quantity > 0) {
          return 'SELL';
        }
      }
    }

    return 'HOLD';
  }

  getPositionSize(signal: 'BUY' | 'SELL' | 'HOLD', currentPrice: number, availableCash: number, currentPosition?: any): number {
    if (signal === 'BUY') {
      const cashToUse = availableCash * this.parameters.positionSize;
      return Math.floor(cashToUse / currentPrice);
    } else if (signal === 'SELL' && currentPosition) {
      return currentPosition.quantity;
    }
    return 0;
  }

  private evaluateCondition(condition: Condition, prices: any[], currentIndex: number): boolean {
    const closePrices = prices.map(p => p.close);
    
    // Simplified condition evaluation
    switch (condition.indicator) {
      case 'SMA':
        const sma = this.sma(closePrices, 20, currentIndex);
        if (!sma) return false;
        return this.compareValues(sma, condition.operator, Number(condition.value));
      
      case 'RSI':
        const rsi = this.rsi(closePrices, 14, currentIndex);
        if (!rsi) return false;
        return this.compareValues(rsi, condition.operator, Number(condition.value));
      
      case 'Price':
        const currentPrice = prices[currentIndex]?.close;
        if (!currentPrice) return false;
        return this.compareValues(currentPrice, condition.operator, Number(condition.value));
      
      default:
        return false;
    }
  }

  private compareValues(actual: number, operator: string, target: number): boolean {
    switch (operator) {
      case '>': return actual > target;
      case '<': return actual < target;
      case '>=': return actual >= target;
      case '<=': return actual <= target;
      case '==': return Math.abs(actual - target) < 0.01;
      default: return false;
    }
  }
}

export const StrategyBuilder: React.FC<StrategyBuilderProps> = ({ onStrategyCreated }) => {
  const [strategyName, setStrategyName] = useState('');
  const [strategyDescription, setStrategyDescription] = useState('');
  const [rules, setRules] = useState<StrategyRule[]>([]);
  const [currentRule, setCurrentRule] = useState<StrategyRule>({
    id: '',
    action: 'BUY',
    conditions: [],
    positionSize: 0.8
  });

  const indicators = [
    { value: 'SMA', label: 'Simple Moving Average' },
    { value: 'EMA', label: 'Exponential Moving Average' },
    { value: 'RSI', label: 'RSI' },
    { value: 'Price', label: 'Current Price' },
    { value: 'Volume', label: 'Volume' },
    { value: 'MACD', label: 'MACD' }
  ];

  const operators = [
    { value: '>', label: 'Greater Than' },
    { value: '<', label: 'Less Than' },
    { value: '>=', label: 'Greater Than or Equal' },
    { value: '<=', label: 'Less Than or Equal' },
    { value: '==', label: 'Equal To' }
  ];

  const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addCondition = () => {
    const newCondition: Condition = {
      id: generateId(),
      indicator: 'SMA',
      operator: '>',
      value: 100
    };

    setCurrentRule(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }));
  };

  const removeCondition = (conditionId: string) => {
    setCurrentRule(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== conditionId)
    }));
  };

  const updateCondition = (conditionId: string, field: keyof Condition, value: any) => {
    setCurrentRule(prev => ({
      ...prev,
      conditions: prev.conditions.map(c => 
        c.id === conditionId ? { ...c, [field]: value } : c
      )
    }));
  };

  const addRule = () => {
    if (currentRule.conditions.length === 0) return;

    const newRule: StrategyRule = {
      ...currentRule,
      id: generateId()
    };

    setRules(prev => [...prev, newRule]);
    setCurrentRule({
      id: '',
      action: 'BUY',
      conditions: [],
      positionSize: 0.8
    });
  };

  const removeRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const createStrategy = () => {
    if (!strategyName.trim() || rules.length === 0) return;

    const customStrategy = new CustomStrategy({
      name: strategyName,
      description: strategyDescription,
      rules
    });

    onStrategyCreated(customStrategy);
    
    // Reset form
    setStrategyName('');
    setStrategyDescription('');
    setRules([]);
    setCurrentRule({
      id: '',
      action: 'BUY',
      conditions: [],
      positionSize: 0.8
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Definition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Strategy Definition
            </CardTitle>
            <CardDescription>
              Define the basic properties of your custom trading strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="strategyName">Strategy Name</Label>
              <Input
                id="strategyName"
                placeholder="My Custom Strategy"
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategyDescription">Description</Label>
              <Textarea
                id="strategyDescription"
                placeholder="Describe what your strategy does and when it trades..."
                value={strategyDescription}
                onChange={(e) => setStrategyDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Custom strategies are simplified for demonstration. Advanced indicator calculations 
                and complex logic would require more sophisticated implementation.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Rule Builder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Rule Builder
            </CardTitle>
            <CardDescription>
              Build trading rules using technical indicators and conditions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="text-sm">Action:</Label>
                <Select 
                  value={currentRule.action} 
                  onValueChange={(value: 'BUY' | 'SELL') => 
                    setCurrentRule(prev => ({ ...prev, action: value }))
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY">BUY</SelectItem>
                    <SelectItem value="SELL">SELL</SelectItem>
                  </SelectContent>
                </Select>
                <Label className="text-sm">when:</Label>
              </div>

              {/* Conditions */}
              <div className="space-y-2">
                {currentRule.conditions.map((condition, index) => (
                  <div key={condition.id} className="flex items-center gap-2 p-2 border rounded-lg">
                    {index > 0 && <span className="text-xs text-muted-foreground">AND</span>}
                    
                    <Select 
                      value={condition.indicator} 
                      onValueChange={(value) => updateCondition(condition.id, 'indicator', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {indicators.map(indicator => (
                          <SelectItem key={indicator.value} value={indicator.value}>
                            {indicator.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select 
                      value={condition.operator} 
                      onValueChange={(value) => updateCondition(condition.id, 'operator', value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map(operator => (
                          <SelectItem key={operator.value} value={operator.value}>
                            {operator.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      step="0.01"
                      value={condition.value}
                      onChange={(e) => updateCondition(condition.id, 'value', parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCondition(condition.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={addCondition}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Condition
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="positionSize">Position Size (%)</Label>
                <Input
                  id="positionSize"
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={currentRule.positionSize * 100}
                  onChange={(e) => setCurrentRule(prev => ({ 
                    ...prev, 
                    positionSize: (parseFloat(e.target.value) || 0) / 100 
                  }))}
                />
              </div>

              <Button
                onClick={addRule}
                disabled={currentRule.conditions.length === 0}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Rule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Existing Rules */}
      {rules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Strategy Rules ({rules.length})
            </CardTitle>
            <CardDescription>
              Review and manage your trading rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rules.map((rule, ruleIndex) => (
              <div key={rule.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={rule.action === 'BUY' ? 'default' : 'destructive'}>
                      {rule.action}
                    </Badge>
                    <span className="text-sm">when:</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeRule(rule.id)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-sm space-y-1">
                  {rule.conditions.map((condition, condIndex) => (
                    <div key={condition.id} className="flex items-center gap-1">
                      {condIndex > 0 && <span className="text-muted-foreground">AND</span>}
                      <span>{condition.indicator}</span>
                      <span>{condition.operator}</span>
                      <span className="font-medium">{condition.value}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Position Size: {(rule.positionSize * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Create Strategy */}
      <Card>
        <CardContent className="p-6">
          <Button
            onClick={createStrategy}
            disabled={!strategyName.trim() || rules.length === 0}
            size="lg"
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            Create Strategy
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
