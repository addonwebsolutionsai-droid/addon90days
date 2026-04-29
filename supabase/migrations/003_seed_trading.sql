-- Seed batch 4: trading-finance (12 premium skills)
-- World markets, strategies, news analysis, risk management

INSERT INTO skills (slug, title, tagline, description, category, difficulty, is_free, price_inr, pack_id, tags, steps, video_url, trending_score, is_featured, published) VALUES

('stock-screener-ai',
 'AI Stock Screener',
 'Scan NSE/BSE/NYSE for breakout setups using 20+ technical filters',
 'Screen thousands of stocks using AI-powered technical analysis: RSI, MACD, Bollinger Bands, volume surge, 52-week breakouts, and pattern recognition. Returns ranked candidates with confidence scores and entry/stop-loss levels.',
 'trading-finance', 'intermediate', false, 1999, null,
 ARRAY['stocks','screening','NSE','BSE','NYSE','technical-analysis','RSI','MACD'],
 '[
   {"step":1,"title":"Set up screener","language":"typescript","code":"const screener = await runSkill(''stock-screener'', {\n  exchange: [\"NSE\", \"BSE\"],\n  filters: {\n    rsi: { min: 40, max: 60 },\n    macdSignal: \"bullish-crossover\",\n    volumeSurge: 1.5,  // 1.5x avg volume\n    priceAbove200MA: true,\n    weekBreakout: 52\n  },\n  marketCap: \"mid-large\",\n  sector: \"all\",\n  topN: 10\n})"},
   {"step":2,"title":"Screener output","language":"json","code":"{\n  \"candidates\": [\n    {\n      \"symbol\": \"RELIANCE\",\n      \"exchange\": \"NSE\",\n      \"price\": 2847.50,\n      \"confidence\": 87,\n      \"setup\": \"Breakout from 6-month consolidation with 2.1x avg volume\",\n      \"entry\": { \"ideal\": 2850, \"aggressive\": 2870 },\n      \"stopLoss\": 2780,\n      \"target\": { \"T1\": 3000, \"T2\": 3200 },\n      \"riskReward\": 2.8,\n      \"signals\": [\"MACD bullish crossover\", \"RSI 54 rising\", \"Price above 200MA\", \"52-week high breakout\"]\n    }\n  ],\n  \"scanTime\": \"2026-04-28T09:15:00Z\",\n  \"totalScanned\": 4821\n}"},
   {"step":3,"title":"Automate daily scan","language":"typescript","code":"// Run at 9:00 AM IST before market open\nconst cron = ''0 3 30 * * 1-5'' // 9:00 AM IST = 3:30 UTC\n\nsetInterval(async () => {\n  const results = await runSkill(''stock-screener'', config)\n  if (results.candidates.length > 0) {\n    await sendWhatsAppAlert(results.candidates.slice(0, 3))\n  }\n}, 24 * 60 * 60 * 1000)"}
 ]'::jsonb,
 null, 970, true, true),

('options-strategy-builder',
 'Options Strategy Builder',
 'Build Iron Condors, Straddles, and covered calls with P&L charts',
 'Design and analyse options strategies: Iron Condor, Butterfly, Straddle, Strangle, Covered Call, and Bull/Bear spreads. Returns breakeven points, max profit/loss, probability of profit, and Greeks summary.',
 'trading-finance', 'advanced', false, 2999, null,
 ARRAY['options','derivatives','iron-condor','straddle','NSE','F&O','Greeks'],
 '[
   {"step":1,"title":"Build an Iron Condor","language":"typescript","code":"const strategy = await runSkill(''options-strategy'', {\n  underlying: \"NIFTY\",\n  currentPrice: 22500,\n  expiry: \"2026-05-29\",\n  strategy: \"iron-condor\",\n  legs: [\n    { type: \"sell\", strike: 23000, optionType: \"call\", premium: 45 },\n    { type: \"buy\",  strike: 23500, optionType: \"call\", premium: 18 },\n    { type: \"sell\", strike: 22000, optionType: \"put\",  premium: 42 },\n    { type: \"buy\",  strike: 21500, optionType: \"put\",  premium: 16 }\n  ],\n  lotSize: 50\n})"},
   {"step":2,"title":"Strategy analysis","language":"json","code":"{\n  \"strategy\": \"Iron Condor\",\n  \"maxProfit\": 2650,\n  \"maxLoss\": 22350,\n  \"breakevens\": { \"lower\": 21947, \"upper\": 23053 },\n  \"probabilityOfProfit\": 68.4,\n  \"daysToExpiry\": 31,\n  \"greeks\": { \"netDelta\": -0.02, \"netTheta\": 142, \"netVega\": -380 },\n  \"recommendation\": \"Theta positive — benefits from time decay. Exit if NIFTY moves beyond 22800 or 23200 before expiry.\"\n}"}
 ]'::jsonb,
 null, 950, true, true),

('trading-news-analyzer',
 'Market News Sentiment Analyzer',
 'Read 500 news sources, extract market-moving signals in seconds',
 'Analyze financial news from global and Indian sources (ET Markets, MoneyControl, Bloomberg, Reuters) for sentiment, affected sectors, and tradeable signals. Returns bullish/bearish classification with confidence and affected tickers.',
 'trading-finance', 'intermediate', false, 1499, null,
 ARRAY['news','sentiment','trading','NLP','Bloomberg','Reuters','markets'],
 '[
   {"step":1,"title":"Analyze news batch","language":"typescript","code":"const news = await runSkill(''market-news-analyzer'', {\n  headlines: [\n    \"RBI holds repo rate at 6.5%, signals pivot in H2 2026\",\n    \"Infosys Q4 profit misses estimates by 8%, guidance cut\",\n    \"FII inflows surge to $2.1B in April — highest since 2023\",\n    \"Crude oil drops 4% on OPEC output increase decision\"\n  ],\n  context: \"Indian equity markets\"\n})"},
   {"step":2,"title":"Sentiment analysis output","language":"json","code":"{\n  \"signals\": [\n    {\n      \"headline\": \"RBI holds rate, signals pivot H2 2026\",\n      \"sentiment\": \"bullish\",\n      \"confidence\": 82,\n      \"sectors\": [\"Banking\", \"Real Estate\", \"Auto\"],\n      \"tickers\": [\"HDFCBANK\", \"BANKBARODA\", \"LODHA\", \"MARUTI\"],\n      \"action\": \"Rate-sensitive sectors likely to rally. Position in banking index.\",\n      \"timeframe\": \"1-3 days\"\n    },\n    {\n      \"headline\": \"Infosys Q4 misses, guidance cut\",\n      \"sentiment\": \"bearish\",\n      \"confidence\": 91,\n      \"sectors\": [\"IT\"],\n      \"tickers\": [\"INFY\", \"TCS\", \"WIPRO\"],\n      \"action\": \"IT sector headwinds. Avoid fresh longs in large-cap IT.\"\n    }\n  ]\n}"}
 ]'::jsonb,
 null, 920, true, true),

('risk-management-calculator',
 'Position Sizing & Risk Calculator',
 'Kelly Criterion, fixed-fractional, and volatility-based position sizing',
 'Calculate optimal position sizes using Kelly Criterion, fixed-fractional, and volatility-adjusted methods. Inputs account size, win rate, R:R ratio, and ATR. Returns max shares/lots and portfolio risk percentage.',
 'trading-finance', 'beginner', true, 0, null,
 ARRAY['risk-management','position-sizing','Kelly','ATR','portfolio'],
 '[
   {"step":1,"title":"Calculate position size","language":"typescript","code":"const sizing = await runSkill(''position-sizer'', {\n  accountSize: 500000,\n  riskPercent: 1.5,       // Risk 1.5% of account per trade\n  entryPrice: 2850,\n  stopLoss: 2780,\n  method: \"fixed-fractional\",\n  instrument: \"equity\"\n})"},
   {"step":2,"title":"Position sizing output","language":"json","code":"{\n  \"method\": \"fixed-fractional\",\n  \"accountRisk\": 7500,\n  \"riskPerShare\": 70,\n  \"shares\": 107,\n  \"capitalRequired\": 304950,\n  \"portfolioExposure\": 61,\n  \"kellerCriterion\": {\n    \"winRate\": 0.55,\n    \"rrRatio\": 2.5,\n    \"kellyFraction\": 0.33,\n    \"halfKelly\": 0.165,\n    \"recommendedRisk\": \"1.5-2% (conservative Kelly)\"\n  },\n  \"atrBased\": {\n    \"atr14\": 85,\n    \"volatilityShares\": 88,\n    \"note\": \"Volatility-adjusted: tighter stop on high ATR\"\n  }\n}"}
 ]'::jsonb,
 null, 890, false, true),

('backtesting-framework',
 'Strategy Backtesting Framework',
 'Test any trading strategy on 20 years of historical data',
 'Backtest trading strategies on historical NSE/BSE/Forex/Crypto data. Generates equity curve, drawdown analysis, Sharpe ratio, win rate, profit factor, and Monte Carlo simulation for robustness testing.',
 'trading-finance', 'advanced', false, 2999, null,
 ARRAY['backtesting','strategy','historical-data','Sharpe','drawdown','quant'],
 '[
   {"step":1,"title":"Define strategy","language":"typescript","code":"const backtest = await runSkill(''backtester'', {\n  strategy: {\n    name: \"Golden Cross\",\n    entry: \"50MA crosses above 200MA AND RSI > 50\",\n    exit: \"50MA crosses below 200MA OR stop-loss hit\",\n    stopLoss: \"2 ATR below entry\",\n    target: \"4 ATR above entry\"\n  },\n  universe: \"NIFTY 50 components\",\n  period: { from: \"2015-01-01\", to: \"2025-12-31\" },\n  capital: 1000000,\n  positionSizing: \"1% risk per trade\"\n})"},
   {"step":2,"title":"Backtest results","language":"json","code":"{\n  \"totalTrades\": 847,\n  \"winRate\": 52.3,\n  \"profitFactor\": 2.18,\n  \"sharpeRatio\": 1.67,\n  \"maxDrawdown\": 18.4,\n  \"cagr\": 24.7,\n  \"finalCapital\": 8470000,\n  \"bestTrade\": { \"stock\": \"RELIANCE\", \"return\": 38.2, \"duration\": 45 },\n  \"worstTrade\": { \"stock\": \"ZOMATO\", \"return\": -5.8, \"duration\": 3 },\n  \"monteCarlo\": {\n    \"runs\": 10000,\n    \"medianCAGR\": 22.1,\n    \"5th_percentile\": 8.4,\n    \"95th_percentile\": 38.6\n  }\n}"}
 ]'::jsonb,
 null, 910, true, true),

('crypto-trading-bot',
 'Crypto Trading Bot Scaffold',
 'CCXT-based bot: RSI strategy, exchange integration, live trading',
 'Build a cryptocurrency trading bot using CCXT library: connects to Binance, Coinbase, WazirX, or any of 100+ exchanges. Includes RSI + EMA strategy, paper trading mode, and Telegram alerts.',
 'trading-finance', 'advanced', false, 2999, null,
 ARRAY['crypto','trading-bot','CCXT','Binance','WazirX','Python','automation'],
 '[
   {"step":1,"title":"Install dependencies","language":"bash","code":"pip install ccxt pandas ta python-telegram-bot\n# Add to .env:\n# EXCHANGE_ID=binance\n# API_KEY=your_api_key\n# API_SECRET=your_api_secret\n# TELEGRAM_BOT_TOKEN=...\n# TELEGRAM_CHAT_ID=..."},
   {"step":2,"title":"RSI + EMA bot","language":"python","code":"import ccxt\nimport pandas as pd\nimport ta\n\nexchange = ccxt.binance({\n    ''apiKey'': os.getenv(''API_KEY''),\n    ''secret'': os.getenv(''API_SECRET'')\n})\n\ndef get_signals(symbol: str, timeframe: str = ''1h'') -> dict:\n    ohlcv = exchange.fetch_ohlcv(symbol, timeframe, limit=200)\n    df = pd.DataFrame(ohlcv, columns=[''timestamp'', ''open'', ''high'', ''low'', ''close'', ''volume''])\n    df[''rsi''] = ta.momentum.RSIIndicator(df[''close''], window=14).rsi()\n    df[''ema_50''] = ta.trend.EMAIndicator(df[''close''], window=50).ema_indicator()\n    df[''ema_200''] = ta.trend.EMAIndicator(df[''close''], window=200).ema_indicator()\n    \n    last = df.iloc[-1]\n    if last[''rsi''] < 35 and last[''ema_50''] > last[''ema_200'']:\n        return { ''signal'': ''BUY'', ''rsi'': last[''rsi''], ''price'': last[''close''] }\n    elif last[''rsi''] > 70:\n        return { ''signal'': ''SELL'', ''rsi'': last[''rsi''], ''price'': last[''close''] }\n    return { ''signal'': ''HOLD'' }"},
   {"step":3,"title":"Paper trading loop","language":"python","code":"def run_bot(paper_mode: bool = True):\n    while True:\n        signal = get_signals(''BTC/USDT'')\n        if signal[''signal''] == ''BUY'':\n            if paper_mode:\n                print(f\"[PAPER] BUY at {signal[''price'']}\")\n            else:\n                exchange.create_order(''BTC/USDT'', ''market'', ''buy'', 0.001)\n            send_telegram_alert(f\"🟢 BUY signal BTC @ {signal[''price'']}\")\n        time.sleep(3600)  # Check every hour"}
 ]'::jsonb,
 null, 940, true, true),

('portfolio-tracker',
 'AI Portfolio Tracker & Analyzer',
 'Import holdings, get rebalancing advice and sector exposure map',
 'Upload your portfolio (NSE, BSE, or US stocks) and get an AI analysis: sector concentration, overlap with index, correlation matrix, rebalancing recommendations, and tax-loss harvesting opportunities.',
 'trading-finance', 'intermediate', false, 1499, null,
 ARRAY['portfolio','tracker','rebalancing','sector','allocation','NSE','NASDAQ'],
 '[
   {"step":1,"title":"Import your portfolio","language":"typescript","code":"const analysis = await runSkill(''portfolio-analyzer'', {\n  holdings: [\n    { symbol: \"RELIANCE\", exchange: \"NSE\", quantity: 50, avgCost: 2600 },\n    { symbol: \"HDFCBANK\", exchange: \"NSE\", quantity: 100, avgCost: 1550 },\n    { symbol: \"AAPL\", exchange: \"NASDAQ\", quantity: 20, avgCost: 175 },\n    { symbol: \"INFY\", exchange: \"NSE\", quantity: 200, avgCost: 1400 }\n  ],\n  currency: \"INR\"\n})"},
   {"step":2,"title":"Portfolio analysis","language":"json","code":"{\n  \"totalValue\": 985000,\n  \"totalGain\": 87500,\n  \"gainPct\": 9.74,\n  \"sectorAllocation\": {\n    \"Oil & Gas\": 42,\n    \"Banking\": 31,\n    \"Technology\": 27\n  },\n  \"concentration\": \"HIGH — top holding is 42% of portfolio\",\n  \"rebalancing\": [\n    { \"action\": \"REDUCE\", \"symbol\": \"RELIANCE\", \"from\": 42, \"to\": 25, \"reason\": \"Overweight vs index\" },\n    { \"action\": \"ADD\", \"sector\": \"Healthcare\", \"reason\": \"Zero healthcare exposure — consider SUNPHARMA\" }\n  ],\n  \"taxLossHarvesting\": [\n    { \"symbol\": \"INFY\", \"currentLoss\": -18000, \"taxSaving\": 2700, \"action\": \"Sell before March 31\" }\n  ]\n}"}
 ]'::jsonb,
 null, 870, false, true),

('forex-strategy-generator',
 'Forex Strategy Generator',
 'Generate and backtest forex strategies for major and exotic pairs',
 'Generate forex trading strategies for any currency pair: trend-following, mean-reversion, and breakout strategies with specific entry/exit rules, timeframe, and currency pair selection guidance.',
 'trading-finance', 'intermediate', false, 1999, null,
 ARRAY['forex','FX','strategy','EUR-USD','USD-INR','trading'],
 '[
   {"step":1,"title":"Generate forex strategy","language":"typescript","code":"const strategy = await runSkill(''forex-strategy'', {\n  pair: \"USD/INR\",\n  style: \"trend-following\",\n  timeframe: \"4h\",\n  riskPerTrade: 1.5,\n  tradingSession: \"London-New York overlap\"\n})"},
   {"step":2,"title":"Strategy output","language":"json","code":"{\n  \"name\": \"USD/INR EMA Trend Rider\",\n  \"pair\": \"USD/INR\",\n  \"timeframe\": \"4H\",\n  \"setup\": \"Trade with the trend when EMA 21 > EMA 55 > EMA 200\",\n  \"entry\": {\n    \"long\": \"Price pulls back to EMA 21, RSI between 40-55, bullish pin bar on 1H\",\n    \"short\": \"Price bounces to EMA 21, RSI between 45-60, bearish engulfing on 1H\"\n  },\n  \"stopLoss\": \"Below last swing low / above last swing high (min 30 pips)\",\n  \"target\": \"2.5R or next major resistance\",\n  \"filters\": [\"Avoid RBI announcement days\", \"Avoid last 30 min before 5:30 PM IST close\"],\n  \"historicalWinRate\": 54.2,\n  \"avgRR\": 2.4\n}"}
 ]'::jsonb,
 null, 860, false, true),

('fundamental-analysis-ai',
 'AI Fundamental Analysis',
 'DCF valuation, ratio analysis, and earnings quality score in seconds',
 'Perform deep fundamental analysis on any listed company: DCF valuation with multiple scenarios, key ratio analysis (P/E, P/B, ROE, ROCE, Debt/EBITDA), earnings quality score, and buy/sell/hold recommendation.',
 'trading-finance', 'intermediate', false, 2499, null,
 ARRAY['fundamental-analysis','DCF','valuation','ratios','ROE','equity-research'],
 '[
   {"step":1,"title":"Analyze a stock","language":"typescript","code":"const analysis = await runSkill(''fundamental-analysis'', {\n  symbol: \"HDFCBANK\",\n  exchange: \"NSE\",\n  years: 5,\n  growthScenarios: { bear: 8, base: 14, bull: 20 },\n  wacc: 12,\n  terminalGrowth: 5\n})"},
   {"step":2,"title":"Fundamental report","language":"json","code":"{\n  \"symbol\": \"HDFCBANK\",\n  \"currentPrice\": 1720,\n  \"dcfValuation\": {\n    \"bear\": 1450,\n    \"base\": 1980,\n    \"bull\": 2650\n  },\n  \"recommendation\": \"BUY — 15% upside at base case\",\n  \"ratios\": {\n    \"pe\": 18.4, \"pb\": 2.8, \"roe\": 16.8, \"roce\": 14.2,\n    \"debtEquity\": 0.9, \"grossNPA\": 1.17, \"netNPA\": 0.27\n  },\n  \"earningsQuality\": {\n    \"score\": 84,\n    \"cashConversion\": \"High — 92% of profits backed by cash flow\",\n    \"redFlags\": [\"Rising credit costs in Q3 2025 — monitor\"]\n  },\n  \"moat\": \"Wide — largest private bank, distribution advantage, low-cost deposits\"\n}"}
 ]'::jsonb,
 null, 900, true, true),

('algo-trading-scaffold',
 'Algo Trading System Scaffold',
 'Zerodha Kite/Angel One API integration with order management',
 'Build a complete algorithmic trading system integrated with Zerodha Kite Connect or Angel One Smart API: live data feed, order placement, position management, and P&L tracking.',
 'trading-finance', 'advanced', false, 2999, null,
 ARRAY['algo-trading','Zerodha','Kite','Angel-One','Python','automation','NSE'],
 '[
   {"step":1,"title":"Zerodha Kite setup","language":"python","code":"from kiteconnect import KiteConnect\nimport os\n\nkite = KiteConnect(api_key=os.getenv(''KITE_API_KEY''))\n\n# Step 1: Get login URL (do this once)\nprint(kite.login_url())\n\n# Step 2: After login, generate session\ndata = kite.generate_session(request_token=''REQUEST_TOKEN'', api_secret=os.getenv(''KITE_API_SECRET''))\nkite.set_access_token(data[''access_token''])"},
   {"step":2,"title":"Live data + order placement","language":"python","code":"# Subscribe to live ticks\ndef on_ticks(ws, ticks):\n    for tick in ticks:\n        if tick[''instrument_token''] == 408065:  # RELIANCE\n            price = tick[''last_price'']\n            if should_buy(price):\n                order_id = kite.place_order(\n                    variety=kite.VARIETY_REGULAR,\n                    exchange=kite.EXCHANGE_NSE,\n                    tradingsymbol=\"RELIANCE\",\n                    transaction_type=kite.TRANSACTION_TYPE_BUY,\n                    quantity=10,\n                    order_type=kite.ORDER_TYPE_MARKET,\n                    product=kite.PRODUCT_MIS\n                )\n                print(f\"Order placed: {order_id}\")"},
   {"step":3,"title":"Position monitor","language":"python","code":"def monitor_positions():\n    positions = kite.positions()[''net'']\n    for pos in positions:\n        if pos[''quantity''] != 0:\n            pnl = pos[''pnl'']\n            if pnl < -5000:  # Stop loss\n                kite.place_order(variety=kite.VARIETY_REGULAR, exchange=kite.EXCHANGE_NSE,\n                    tradingsymbol=pos[''tradingsymbol''], transaction_type=kite.TRANSACTION_TYPE_SELL,\n                    quantity=abs(pos[''quantity'']), order_type=kite.ORDER_TYPE_MARKET,\n                    product=kite.PRODUCT_MIS)"}
 ]'::jsonb,
 null, 960, true, true),

('market-regime-detector',
 'Market Regime Detector',
 'Identify bull, bear, or sideways regime — switch strategies automatically',
 'Detect the current market regime (trending bull, trending bear, high-volatility, low-volatility sideways) using VIX, market breadth, moving average slope, and advance-decline ratio. Returns regime + recommended strategy type.',
 'trading-finance', 'intermediate', false, 1499, null,
 ARRAY['market-regime','VIX','breadth','volatility','macro','NIFTY'],
 '[
   {"step":1,"title":"Detect current regime","language":"typescript","code":"const regime = await runSkill(''market-regime'', {\n  index: \"NIFTY\",\n  indicators: {\n    vix: 14.2,\n    advanceDecline: 1.8,      // Advances / Declines\n    pctAbove200MA: 67,         // % stocks above 200-day MA\n    niftySlope50d: 0.42       // Slope of 50-day MA\n  }\n})"},
   {"step":2,"title":"Regime output + strategy","language":"json","code":"{\n  \"regime\": \"Trending Bull\",\n  \"confidence\": 84,\n  \"signals\": {\n    \"vix\": \"Low (14.2) — Low fear\",\n    \"breadth\": \"Strong — 67% stocks above 200MA\",\n    \"momentum\": \"Positive — 50MA slope rising\",\n    \"adRatio\": \"Bullish — 1.8x more advances than declines\"\n  },\n  \"recommendedStrategies\": [\n    { \"type\": \"Momentum\", \"rationale\": \"Strong uptrend — buy breakouts, ride winners\" },\n    { \"type\": \"Covered Calls\", \"rationale\": \"Low VIX = reduce options premium income\" }\n  ],\n  \"avoid\": [\"Short selling\", \"Iron Condors in low VIX\"],\n  \"nextReview\": \"Weekly — watch for VIX spike above 20\"\n}"}
 ]'::jsonb,
 null, 880, false, true),

('global-asset-scanner',
 'Global Asset Class Scanner',
 'Scan equities, bonds, commodities, forex, and crypto for opportunities',
 'Scan across all major asset classes simultaneously: NSE/BSE stocks, US equities, gold/silver/crude, forex majors, crypto, and Indian bonds. Identifies cross-asset trends and relative strength opportunities.',
 'trading-finance', 'advanced', false, 2499, null,
 ARRAY['multi-asset','global-markets','commodities','bonds','forex','crypto','equities'],
 '[
   {"step":1,"title":"Run global scan","language":"typescript","code":"const scan = await runSkill(''global-asset-scanner'', {\n  assetClasses: [\"equities\", \"commodities\", \"forex\", \"crypto\", \"bonds\"],\n  regions: [\"India\", \"US\", \"Global\"],\n  timeframe: \"weekly\",\n  date: \"2026-04-28\"\n})"},
   {"step":2,"title":"Cross-asset opportunity map","language":"json","code":"{\n  \"topOpportunities\": [\n    { \"asset\": \"Gold\", \"class\": \"commodity\", \"trend\": \"bullish\", \"signal\": \"All-time high breakout, central bank buying\", \"action\": \"ACCUMULATE — SGBs or GOLDBEES\" },\n    { \"asset\": \"USD/INR\", \"class\": \"forex\", \"trend\": \"neutral\", \"signal\": \"Range 83.5-84.5, RBI intervention likely\", \"action\": \"Sell USD at 84.3, buy at 83.6\" },\n    { \"asset\": \"BTC\", \"class\": \"crypto\", \"trend\": \"bullish\", \"signal\": \"Post-halving momentum, ETF inflows\", \"action\": \"Small position, 3-5% of portfolio max\" }\n  ],\n  \"riskFlags\": [\n    \"US 10Y yield rising — headwind for growth stocks\",\n    \"India VIX below 13 — complacency risk\"\n  ],\n  \"assetRotation\": \"Capital rotating from IT to PSU banks + defence\"\n}"}
 ]'::jsonb,
 null, 930, true, true);
