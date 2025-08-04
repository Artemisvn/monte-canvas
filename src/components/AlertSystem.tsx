import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  Volume2, 
  Zap,
  Plus,
  Trash2,
  Settings,
  AlertTriangle
} from 'lucide-react';

interface Alert {
  id: string;
  symbol: string;
  type: 'price' | 'volume' | 'technical' | 'news';
  condition: 'above' | 'below' | 'crosses';
  value: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
  description: string;
}

interface LiveAlert {
  id: string;
  symbol: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  timestamp: string;
}

export const AlertSystem: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([]);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    type: 'price' as Alert['type'],
    condition: 'above' as Alert['condition'],
    value: 0,
    description: ''
  });
  const [isGlobalEnabled, setIsGlobalEnabled] = useState(true);
  const { toast } = useToast();

  // Simulate live alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (isGlobalEnabled && alerts.length > 0) {
        const activeAlerts = alerts.filter(alert => alert.isActive);
        
        if (activeAlerts.length > 0 && Math.random() < 0.3) {
          const randomAlert = activeAlerts[Math.floor(Math.random() * activeAlerts.length)];
          const currentPrice = Math.random() * 200 + 50;
          
          let shouldTrigger = false;
          let alertType: 'success' | 'warning' | 'info' = 'info';
          let message = '';

          if (randomAlert.type === 'price') {
            if (randomAlert.condition === 'above' && currentPrice > randomAlert.value) {
              shouldTrigger = true;
              alertType = 'success';
              message = `${randomAlert.symbol} price ${currentPrice.toFixed(2)} is above target ${randomAlert.value}`;
            } else if (randomAlert.condition === 'below' && currentPrice < randomAlert.value) {
              shouldTrigger = true;
              alertType = 'warning';
              message = `${randomAlert.symbol} price ${currentPrice.toFixed(2)} is below target ${randomAlert.value}`;
            }
          }

          if (shouldTrigger) {
            const liveAlert: LiveAlert = {
              id: Date.now().toString(),
              symbol: randomAlert.symbol,
              message,
              type: alertType,
              timestamp: new Date().toISOString()
            };

            setLiveAlerts(prev => [liveAlert, ...prev.slice(0, 9)]);
            
            toast({
              title: "Alert Triggered!",
              description: message,
              variant: alertType === 'warning' ? 'destructive' : 'default',
            });

            // Mark alert as triggered
            setAlerts(prev => prev.map(alert => 
              alert.id === randomAlert.id 
                ? { ...alert, triggeredAt: new Date().toISOString() }
                : alert
            ));
          }
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [alerts, isGlobalEnabled, toast]);

  const handleCreateAlert = () => {
    if (!newAlert.symbol || !newAlert.value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const alert: Alert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol.toUpperCase(),
      type: newAlert.type,
      condition: newAlert.condition,
      value: newAlert.value,
      isActive: true,
      createdAt: new Date().toISOString(),
      description: newAlert.description || `${newAlert.symbol} ${newAlert.condition} ${newAlert.value}`
    };

    setAlerts(prev => [...prev, alert]);
    setNewAlert({
      symbol: '',
      type: 'price',
      condition: 'above',
      value: 0,
      description: ''
    });

    toast({
      title: "Alert Created",
      description: `Alert for ${alert.symbol} has been created`,
    });
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast({
      title: "Alert Deleted",
      description: "Alert has been removed",
    });
  };

  const handleToggleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, isActive: !alert.isActive }
        : alert
    ));
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'price': return <TrendingUp className="h-4 w-4" />;
      case 'volume': return <Volume2 className="h-4 w-4" />;
      case 'technical': return <Zap className="h-4 w-4" />;
      case 'news': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertTypeColor = (type: LiveAlert['type']) => {
    switch (type) {
      case 'success': return 'border-l-success bg-success/5';
      case 'warning': return 'border-l-destructive bg-destructive/5';
      case 'info': return 'border-l-primary bg-primary/5';
      default: return 'border-l-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alert & Notification System
              </CardTitle>
              <CardDescription>
                Set up intelligent alerts for price movements, volume spikes, and market events
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="global-alerts"
                  checked={isGlobalEnabled}
                  onCheckedChange={setIsGlobalEnabled}
                />
                <Label htmlFor="global-alerts">Enable Alerts</Label>
              </div>
              <Badge variant={isGlobalEnabled ? "default" : "secondary"}>
                {alerts.filter(a => a.isActive).length} Active
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live">Live Alerts</TabsTrigger>
          <TabsTrigger value="manage">Manage Alerts</TabsTrigger>
          <TabsTrigger value="create">Create Alert</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {liveAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No alerts triggered yet</p>
                  <p className="text-sm text-muted-foreground">Create some alerts to start monitoring the market</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveAlerts.map(alert => (
                    <div 
                      key={alert.id} 
                      className={`p-4 rounded-lg border-l-4 ${getAlertTypeColor(alert.type)} animate-fade-in`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{alert.symbol}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Alert Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No alerts configured</p>
                  <p className="text-sm text-muted-foreground">Create your first alert to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map(alert => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-primary">
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{alert.symbol}</Badge>
                              <Badge variant="secondary">{alert.type}</Badge>
                              <Badge variant={alert.isActive ? "default" : "secondary"}>
                                {alert.isActive ? "Active" : "Paused"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{alert.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Created: {new Date(alert.createdAt).toLocaleDateString()}
                              {alert.triggeredAt && (
                                <span className="ml-2">
                                  • Last triggered: {new Date(alert.triggeredAt).toLocaleString()}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={alert.isActive}
                            onCheckedChange={() => handleToggleAlert(alert.id)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAlert(alert.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Alert
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="AAPL"
                    value={newAlert.symbol}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Alert Type</Label>
                  <Select value={newAlert.type} onValueChange={(value: Alert['type']) => 
                    setNewAlert(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price Alert</SelectItem>
                      <SelectItem value="volume">Volume Alert</SelectItem>
                      <SelectItem value="technical">Technical Alert</SelectItem>
                      <SelectItem value="news">News Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select value={newAlert.condition} onValueChange={(value: Alert['condition']) => 
                    setNewAlert(prev => ({ ...prev, condition: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Above</SelectItem>
                      <SelectItem value="below">Below</SelectItem>
                      <SelectItem value="crosses">Crosses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Target Value</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="150.00"
                    value={newAlert.value || ''}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Custom alert description..."
                  value={newAlert.description}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <Button onClick={handleCreateAlert} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};