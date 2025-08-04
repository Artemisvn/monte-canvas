import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Plus, 
  Edit,
  Trash2,
  Star,
  Calendar,
  TrendingUp,
  Target,
  Lightbulb,
  Tag
} from 'lucide-react';

interface ResearchNote {
  id: string;
  title: string;
  content: string;
  category: 'idea' | 'analysis' | 'strategy' | 'market-event' | 'performance';
  tags: string[];
  symbols: string[];
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export const ResearchNotebook: React.FC = () => {
  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<ResearchNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'idea' as ResearchNote['category'],
    tags: '',
    symbols: '',
    priority: 'medium' as ResearchNote['priority']
  });
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Sample research notes
  useEffect(() => {
    const sampleNotes: ResearchNote[] = [
      {
        id: '1',
        title: 'Q4 Earnings Season Analysis',
        content: `# Q4 Earnings Season Analysis

## Key Observations
- Tech sector showing strong momentum with 85% beat rate
- Energy sector underperforming with mixed results
- Consumer discretionary showing resilience despite economic headwinds

## Trading Opportunities
1. **Long AAPL** - Strong iPhone sales, services growth
2. **Short retail** - Inventory concerns heading into 2024
3. **Pairs trade**: Long QQQ / Short XLE

## Risk Factors
- Fed policy uncertainty
- Geopolitical tensions
- Supply chain disruptions

## Action Items
- [ ] Monitor guidance revisions
- [ ] Track margin compression trends
- [ ] Review sector rotation patterns`,
        category: 'analysis',
        tags: ['earnings', 'sector-analysis', 'q4'],
        symbols: ['AAPL', 'QQQ', 'XLE'],
        priority: 'high',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isFavorite: true
      },
      {
        id: '2',
        title: 'AI Revolution Investment Thesis',
        content: `# AI Revolution Investment Thesis

## Investment Theme
The artificial intelligence revolution is creating unprecedented opportunities across multiple sectors.

## Key Players
- **Infrastructure**: NVDA, AMD, INTC
- **Software**: MSFT, GOOGL, CRM
- **Applications**: PLTR, SNOW, AI

## Valuation Concerns
Current multiples may be stretched, but growth potential is significant.

## Timeline
- Short-term: Volatility expected
- Medium-term: Consolidation phase
- Long-term: Massive value creation`,
        category: 'idea',
        tags: ['ai', 'technology', 'long-term'],
        symbols: ['NVDA', 'MSFT', 'GOOGL'],
        priority: 'high',
        createdAt: '2024-01-10T14:30:00Z',
        updatedAt: '2024-01-12T09:15:00Z',
        isFavorite: true
      },
      {
        id: '3',
        title: 'Mean Reversion Strategy Performance',
        content: `# Mean Reversion Strategy Performance Review

## Strategy Overview
- Entry: RSI < 30, Price below 20-day SMA
- Exit: RSI > 70 or 5% profit target
- Stop: 3% below entry

## Recent Performance
- Win Rate: 68%
- Average Win: 4.2%
- Average Loss: -2.8%
- Sharpe Ratio: 1.34

## Optimization Ideas
1. Add volume filter
2. Consider sector momentum
3. Adjust position sizing based on VIX

## Next Steps
- Backtest with volume filter
- Paper trade refined version`,
        category: 'strategy',
        tags: ['mean-reversion', 'rsi', 'backtesting'],
        symbols: ['SPY', 'QQQ'],
        priority: 'medium',
        createdAt: '2024-01-08T11:20:00Z',
        updatedAt: '2024-01-08T11:20:00Z',
        isFavorite: false
      }
    ];

    setNotes(sampleNotes);
  }, []);

  const handleCreateNote = () => {
    if (!newNote.title || !newNote.content) {
      toast({
        title: "Error",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    const note: ResearchNote = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      tags: newNote.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      symbols: newNote.symbols.split(',').map(symbol => symbol.trim().toUpperCase()).filter(Boolean),
      priority: newNote.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false
    };

    setNotes(prev => [note, ...prev]);
    setNewNote({
      title: '',
      content: '',
      category: 'idea',
      tags: '',
      symbols: '',
      priority: 'medium'
    });

    toast({
      title: "Note Created",
      description: "Research note has been saved",
    });
  };

  const handleUpdateNote = () => {
    if (!selectedNote) return;

    setNotes(prev => prev.map(note => 
      note.id === selectedNote.id 
        ? { ...selectedNote, updatedAt: new Date().toISOString() }
        : note
    ));
    setIsEditing(false);

    toast({
      title: "Note Updated",
      description: "Changes have been saved",
    });
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }

    toast({
      title: "Note Deleted",
      description: "Research note has been removed",
    });
  };

  const handleToggleFavorite = (noteId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, isFavorite: !note.isFavorite }
        : note
    ));
  };

  const filteredNotes = notes.filter(note => {
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: ResearchNote['category']) => {
    switch (category) {
      case 'idea': return <Lightbulb className="h-4 w-4" />;
      case 'analysis': return <TrendingUp className="h-4 w-4" />;
      case 'strategy': return <Target className="h-4 w-4" />;
      case 'market-event': return <Calendar className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: ResearchNote['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-destructive';
      case 'medium': return 'border-l-warning';
      case 'low': return 'border-l-muted';
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
                <BookOpen className="h-5 w-5" />
                Research Notebook
              </CardTitle>
              <CardDescription>
                Document trading ideas, market analysis, and strategy insights
              </CardDescription>
            </div>
            <Badge variant="outline">
              {notes.length} Notes
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="idea">Ideas</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="strategy">Strategies</SelectItem>
                    <SelectItem value="market-event">Market Events</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notes List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Notes ({filteredNotes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredNotes.map(note => (
                  <div
                    key={note.id}
                    className={`p-3 border-l-4 cursor-pointer rounded-r hover:bg-muted/50 transition-colors ${
                      selectedNote?.id === note.id ? 'bg-muted' : ''
                    } ${getPriorityColor(note.priority)}`}
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getCategoryIcon(note.category)}
                          <h3 className="text-sm font-medium truncate">{note.title}</h3>
                          {note.isFavorite && <Star className="h-3 w-3 text-warning fill-current" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {note.content.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {note.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="view" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">View Note</TabsTrigger>
              <TabsTrigger value="create">Create Note</TabsTrigger>
            </TabsList>

            <TabsContent value="view">
              {selectedNote ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(selectedNote.category)}
                        <CardTitle>{selectedNote.title}</CardTitle>
                        {selectedNote.isFavorite && <Star className="h-4 w-4 text-warning fill-current" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFavorite(selectedNote.id)}
                        >
                          <Star className={`h-4 w-4 ${selectedNote.isFavorite ? 'text-warning fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(selectedNote.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created: {new Date(selectedNote.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(selectedNote.updatedAt).toLocaleDateString()}</span>
                      <Badge variant="outline">{selectedNote.priority} priority</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={selectedNote.title}
                            onChange={(e) => setSelectedNote(prev => prev ? { ...prev, title: e.target.value } : null)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Content</Label>
                          <Textarea
                            rows={15}
                            value={selectedNote.content}
                            onChange={(e) => setSelectedNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                            className="font-mono text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleUpdateNote}>Save Changes</Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap text-sm">{selectedNote.content}</pre>
                        </div>
                        
                        {selectedNote.symbols.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Related Symbols</Label>
                            <div className="flex flex-wrap gap-2">
                              {selectedNote.symbols.map(symbol => (
                                <Badge key={symbol} variant="secondary">{symbol}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {selectedNote.tags.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Tags</Label>
                            <div className="flex flex-wrap gap-2">
                              {selectedNote.tags.map(tag => (
                                <Badge key={tag} variant="outline">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Select a note to view or create a new one</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Research Note
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="Note title..."
                        value={newNote.title}
                        onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={newNote.category} onValueChange={(value: ResearchNote['category']) => 
                        setNewNote(prev => ({ ...prev, category: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="idea">Trading Idea</SelectItem>
                          <SelectItem value="analysis">Market Analysis</SelectItem>
                          <SelectItem value="strategy">Strategy Notes</SelectItem>
                          <SelectItem value="market-event">Market Event</SelectItem>
                          <SelectItem value="performance">Performance Review</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select value={newNote.priority} onValueChange={(value: ResearchNote['priority']) => 
                        setNewNote(prev => ({ ...prev, priority: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Symbols (comma-separated)</Label>
                      <Input
                        placeholder="AAPL, GOOGL, MSFT"
                        value={newNote.symbols}
                        onChange={(e) => setNewNote(prev => ({ ...prev, symbols: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      placeholder="earnings, tech, bullish"
                      value={newNote.tags}
                      onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      rows={12}
                      placeholder="Write your research note here..."
                      value={newNote.content}
                      onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <Button onClick={handleCreateNote} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Note
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};