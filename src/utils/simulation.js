export const simulateAuction = (keyword, competitors) => {
  const qualityScore = parseFloat((6 + Math.random() * 4).toFixed(1));
  const myScore = keyword.bid * (qualityScore / 10);
  const competitorScores = competitors.map(c => ({
    name: c,
    bid: parseFloat((0.3 + Math.random() * 1.2).toFixed(2)),
    quality: parseFloat((5 + Math.random() * 5).toFixed(1)),
  })).map(c => ({ ...c, score: c.bid * (c.quality / 10) }));

  const allScores = [{ name: 'Your Ad', score: myScore, bid: keyword.bid, quality: qualityScore }, ...competitorScores]
    .sort((a, b) => b.score - a.score);

  const position = allScores.findIndex(s => s.name === 'Your Ad') + 1;
  const nextBid = allScores[position] ? parseFloat((allScores[position].score / (qualityScore / 10) + 0.01).toFixed(2)) : keyword.bid;

  return { position, qualityScore, allScores, actualCpc: nextBid };
};

export const getSearchTerms = (keywords) => {
  const expansions = {
    'wireless headphones': ['wireless headphones for gym', 'wireless headphones noise cancelling', 'wireless over ear headphones', 'best wireless headphones 2024'],
    'bluetooth headphones': ['bluetooth headphones with mic', 'bluetooth headphones for tv', 'bluetooth over ear headphones'],
    'noise cancelling': ['noise cancelling headphones office', 'noise cancelling earbuds', 'active noise cancelling'],
  };
  const terms = [];
  keywords.forEach(kw => {
    const base = kw.keyword.toLowerCase();
    const exps = expansions[base] || [`${base} best`, `buy ${base}`, `${base} review`];
    exps.forEach(term => {
      terms.push({
        searchTerm: term,
        keyword: kw.keyword,
        matchType: kw.matchType,
        impressions: Math.floor(100 + Math.random() * 2000),
        clicks: Math.floor(5 + Math.random() * 80),
        spend: parseFloat((1 + Math.random() * 20).toFixed(2)),
        orders: Math.floor(Math.random() * 10),
        sales: parseFloat((Math.random() * 300).toFixed(2)),
        ctr: parseFloat((1 + Math.random() * 5).toFixed(2)),
        cpc: parseFloat((0.2 + Math.random() * 1).toFixed(2)),
        acos: parseFloat((5 + Math.random() * 40).toFixed(2)),
      });
    });
  });
  return terms;
};

export const getBidRecommendations = (keywords) =>
  keywords.map(kw => ({
    ...kw,
    suggestedBid: parseFloat((kw.bid * (0.9 + Math.random() * 0.4)).toFixed(2)),
    suggestedBidRange: [
      parseFloat((kw.bid * 0.7).toFixed(2)),
      parseFloat((kw.bid * 1.4).toFixed(2)),
    ],
    estimatedClicks: Math.floor(50 + Math.random() * 200),
    estimatedImpressions: Math.floor(1000 + Math.random() * 5000),
  }));

export const formatCurrency = (val) =>
  `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const formatNumber = (val) => Number(val || 0).toLocaleString('en-IN');
export const formatPercent = (val) => `${Number(val || 0).toFixed(2)}%`;
