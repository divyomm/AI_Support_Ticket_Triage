// Configuration-driven keyword logic
const keywordConfig = {
  urgency: ['urgent', 'asap', 'down', 'critical', 'emergency', 'immediately', 'broken', 'not working'],
  categories: {
    'Billing': ['refund', 'billing', 'charge', 'invoice', 'payment', 'money', 'credit card', 'subscription'],
    'Technical': ['error', 'bug', 'crash', 'not working', 'failing', 'timeout', 'security', 'glitch', 'broken', 'hacked'],
    'Account': ['password', 'login', 'account', 'access', 'locked', 'reset', 'email'],
    'Feature Request': ['feature', 'request', 'add', 'idea', 'nice to have', 'suggest', 'improve']
  }
};

/**
 * Analyzes a ticket message and returns category, priority, urgency, keywords, signals, and confidence.
 */
function analyzeTicket(message) {
  const lowerMessage = message.toLowerCase();
  let urgency = false;
  let signals = [];
  const foundKeywords = new Set();
  
  // 1. Detect Urgency
  for (const word of keywordConfig.urgency) {
    if (lowerMessage.includes(word)) {
      urgency = true;
      foundKeywords.add(word);
      signals.push(`urgency keyword detected: ${word}`);
    }
  }

  // 2. Custom Classification Rules (Overrides/Enforcements)
  if (lowerMessage.includes('refund')) {
    signals.push('custom rule triggered: refund = high priority billing');
    foundKeywords.add('refund');
    
    // Check if there was other urgency to boost even further
    const priority = urgency ? 'P0' : 'P1';

    return {
      category: 'Billing',
      priority: priority,
      urgency: true,
      keywords: Array.from(foundKeywords),
      signals,
      confidence: 1.0 // 100%
    };
  }

  if (lowerMessage.includes('security') || lowerMessage.includes('hacked')) {
    signals.push('custom rule triggered: security/hacked = critical technical item');
    foundKeywords.add('security/hacked');

    return {
      category: 'Technical',
      priority: 'P0',
      urgency: true,
      keywords: Array.from(foundKeywords),
      signals,
      confidence: 1.0 // 100%
    };
  }

  // 3. General Categorization
  const categoryScores = {
    'Billing': 0, 'Technical': 0, 'Account': 0, 'Feature Request': 0, 'Other': 0
  };

  for (const [category, words] of Object.entries(keywordConfig.categories)) {
    for (const word of words) {
      if (lowerMessage.includes(word)) {
        categoryScores[category] += 1;
        foundKeywords.add(word);
        signals.push(`keyword match: ${word} -> ${category}`);
      }
    }
  }

  let topCategory = 'Other';
  let maxScore = 0;
  
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > maxScore) {
      maxScore = score;
      topCategory = category;
    }
  }

  // Include top category signal
  signals.push(`top category selected: ${topCategory}`);

  // 4. Determine Dynamic Priority
  let priorityLevel = 3; // P3

  // If it matched technical or account, start at P2
  if (topCategory === 'Technical' || topCategory === 'Account') {
    priorityLevel = 2;
  }

  // If it has urgency keywords, boost priority 
  if (urgency) {
    priorityLevel = Math.max(0, priorityLevel - 1); // P2 -> P1, etc.
    signals.push('priority boosted due to urgency');
  }

  // Format priority string
  const priority = `P${priorityLevel}`;

  // 5. Calculate Confidence Score (min 100 or keyword matches * 20)
  // Converting back to 0.0 - 1.0 format since DB/Logic expects decimals or percentages
  // Example: 2 keyword matches = 40% confidence. Max is 100.
  let confidencePercentage = Math.min(100, foundKeywords.size * 20);
  
  if (foundKeywords.size === 0) {
    confidencePercentage = 10; // baseline for no matches
    signals.push('no keywords found, falling back to default low confidence');
  }

  const confidence = confidencePercentage / 100;

  return {
    category: topCategory,
    priority,
    urgency,
    keywords: Array.from(foundKeywords),
    signals,
    confidence
  };
}

module.exports = { analyzeTicket, keywordConfig };
