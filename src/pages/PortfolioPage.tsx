import { PortfolioSimulator } from '@/components/PortfolioSimulator';

const PortfolioPage = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Portfolio Analysis</h1>
        <p className="text-muted-foreground mb-8">Advanced portfolio analytics and optimization tools</p>
      </div>
      <PortfolioSimulator />
    </div>
  );
};

export default PortfolioPage;