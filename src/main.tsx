import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import Index from "./pages/Index";
import MarketPage from "./pages/MarketPage";
import OptionsPage from "./pages/OptionsPage";
import BacktestPage from "./pages/BacktestPage";
import MLModelsPage from "./pages/MLModelsPage";
import RiskPage from "./pages/RiskPage";
import AlertsPage from "./pages/AlertsPage";
import ResearchPage from "./pages/ResearchPage";
import MonteCarloPage from "./pages/MonteCarloPage";
import PortfolioPage from "./pages/PortfolioPage";
import PerformancePage from "./pages/PerformancePage";
import SignalsPage from "./pages/SignalsPage";
import StrategyBuilderPage from "./pages/StrategyBuilderPage";
import ChartsPage from "./pages/ChartsPage";
import NotFound from "./pages/NotFound";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Index />} />
          <Route path="market" element={<MarketPage />} />
          <Route path="charts" element={<ChartsPage />} />
          <Route path="options" element={<OptionsPage />} />
          <Route path="backtest" element={<BacktestPage />} />
          <Route path="ml-models" element={<MLModelsPage />} />
          <Route path="risk-management" element={<RiskPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="research" element={<ResearchPage />} />
          <Route path="monte-carlo" element={<MonteCarloPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="performance" element={<PerformancePage />} />
          <Route path="signals" element={<SignalsPage />} />
          <Route path="strategy-builder" element={<StrategyBuilderPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);