import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, symbols } = await req.json()
    
    if (type === 'quote') {
      // Yahoo Finance API endpoint for quotes
      const symbolsStr = symbols.join(',')
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbolsStr}?interval=1d&range=1d&includePrePost=false`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch data from Yahoo Finance')
      }
      
      const data = await response.json()
      
      // Transform Yahoo Finance data to our format
      const marketData = data.chart.result.map((result: any) => {
        const meta = result.meta
        const quote = result.indicators.quote[0]
        
        return {
          symbol: meta.symbol,
          price: meta.regularMarketPrice || 0,
          change: meta.regularMarketPrice - meta.previousClose || 0,
          changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0,
          volume: meta.regularMarketVolume || 0,
          high: meta.regularMarketDayHigh || 0,
          low: meta.regularMarketDayLow || 0,
          marketCap: formatMarketCap(meta.marketCap || 0)
        }
      })
      
      return new Response(
        JSON.stringify({ data: marketData }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }
    
    if (type === 'indices') {
      // Fetch major market indices
      const indices = ['^GSPC', '^IXIC', '^DJI', '^VIX']
      const promises = indices.map(symbol => 
        fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`)
          .then(res => res.json())
      )
      
      const results = await Promise.all(promises)
      const indicesData = results.map((result, index) => {
        const meta = result.chart.result[0].meta
        const indexNames = ['S&P 500', 'NASDAQ', 'DOW', 'VIX']
        
        return {
          name: indexNames[index],
          value: meta.regularMarketPrice || 0,
          change: meta.regularMarketPrice - meta.previousClose || 0,
          changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0
        }
      })
      
      return new Response(
        JSON.stringify({ data: indicesData }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }
    
    throw new Error('Invalid request type')
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`
  }
  return `$${marketCap.toFixed(0)}`
}