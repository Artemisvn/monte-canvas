import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BarChart3,
  Brain,
  Shield,
  TrendingUp,
  Activity,
  Settings,
  PieChart,
  Zap,
  Target,
  BookOpen,
  Bell,
  Calculator
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const mainItems = [
  { 
    title: 'Live Market', 
    id: 'market', 
    icon: Activity,
    description: 'Real-time data & news'
  },
  { 
    title: 'Backtesting Engine', 
    id: 'backtest', 
    icon: BarChart3,
    description: 'Strategy testing & optimization'
  },
  { 
    title: 'ML Models', 
    id: 'ml-models', 
    icon: Brain,
    description: 'AI-powered predictions'
  },
  { 
    title: 'Risk Management', 
    id: 'risk-management', 
    icon: Shield,
    description: 'Portfolio risk analytics'
  },
];

const analyticsItems = [
  { 
    title: 'Options Trading', 
    id: 'options', 
    icon: Calculator,
    description: 'Options pricing & Greeks'
  },
  { 
    title: 'Portfolio Analysis', 
    id: 'portfolio', 
    icon: PieChart,
    description: 'Asset allocation & performance'
  },
  { 
    title: 'Signal Research', 
    id: 'signals', 
    icon: Zap,
    description: 'Alpha factor discovery'
  },
  { 
    title: 'Performance', 
    id: 'performance', 
    icon: TrendingUp,
    description: 'Returns & attribution'
  },
];

const toolsItems = [
  { 
    title: 'Alerts & Notifications', 
    id: 'alerts', 
    icon: Bell,
    description: 'Price & volume alerts'
  },
  { 
    title: 'Research Notebook', 
    id: 'research', 
    icon: BookOpen,
    description: 'Ideas & documentation'
  },
  { 
    title: 'Monte Carlo', 
    id: 'monte-carlo', 
    icon: Activity,
    description: 'Simulation & stress testing'
  },
  { 
    title: 'Strategy Builder', 
    id: 'strategy-builder', 
    icon: Target,
    description: 'Custom algorithm design'
  },
];

export function AppSidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  const isActive = (sectionId: string) => activeSection === sectionId;

  const getNavCls = (sectionId: string) => {
    const active = isActive(sectionId);
    return `group transition-all duration-200 cursor-pointer ${
      active 
        ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' 
        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
    }`;
  };

  const isMainExpanded = mainItems.some((i) => isActive(i.id));
  const isAnalyticsExpanded = analyticsItems.some((i) => isActive(i.id));
  const isToolsExpanded = toolsItems.some((i) => isActive(i.id));

  const SidebarSection = ({ 
    items, 
    label, 
    isExpanded 
  }: { 
    items: typeof mainItems; 
    label: string; 
    isExpanded: boolean;
  }) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className="h-auto p-0">
                <div 
                  className={getNavCls(item.id)}
                  onClick={() => onSectionChange(item.id)}
                >
                  <div className="flex items-center p-3 w-full">
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar
      className={`transition-all duration-300 ${collapsed ? 'w-16' : 'w-72'} border-r border-border/50`}
    >
      <SidebarContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Header */}
        <div className={`p-4 border-b border-border/50 ${collapsed ? 'px-2' : ''}`}>
          {!collapsed ? (
            <div className="animate-fade-in">
              <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                QuantTrade Pro
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Algorithmic Trading Platform
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-2 py-4 space-y-6">
          <SidebarSection 
            items={mainItems} 
            label="Core Modules" 
            isExpanded={isMainExpanded}
          />
          
          <SidebarSection 
            items={analyticsItems} 
            label="Analytics" 
            isExpanded={isAnalyticsExpanded}
          />
          
          <SidebarSection 
            items={toolsItems} 
            label="Tools" 
            isExpanded={isToolsExpanded}
          />
        </div>

        {/* Footer */}
        <div className={`p-4 border-t border-border/50 ${collapsed ? 'px-2' : ''}`}>
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>System Status</span>
                <Badge variant="secondary" className="text-xs">Live</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Market</span>
                <span className="text-success">Open</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}