const { analyzeTicket } = require('../analyzer');

describe('Ticket Analyzer - Improved Logic', () => {
  test('Custom Rule: "refund" returns Billing, P1 or P0 (if urgent), confidence 1.0', () => {
    const result = analyzeTicket('I want a refund for my recent overcharged payment, this is urgent.');
    expect(result.category).toBe('Billing');
    expect(result.priority).toBe('P0'); // P1 boosted to P0 due to 'urgent'
    expect(result.urgency).toBe(true);
    expect(result.confidence).toBe(1.0);
    expect(result.signals).toContain('custom rule triggered: refund = high priority billing');
  });

  test('Custom Rule: "hacked" returns Technical, P0, confidence 1.0', () => {
    const result = analyzeTicket('My account was hacked and there is a security issue.');
    expect(result.category).toBe('Technical');
    expect(result.priority).toBe('P0');
    expect(result.urgency).toBe(true);
    expect(result.confidence).toBe(1.0);
    expect(result.signals).toContain('custom rule triggered: security/hacked = critical technical item');
  });

  test('Heuristic Priority and Signals', () => {
    const result = analyzeTicket('The app keeps failing and is broken right now.');
    expect(result.category).toBe('Technical');
    expect(result.priority).toBe('P1'); // Starts P2 (Technical) -> bumped to P1 because 'broken' is urgent
    expect(result.urgency).toBe(true);
    expect(result.signals).toContain('urgency keyword detected: broken');
    expect(result.signals).toContain('priority boosted due to urgency');
  });

  test('Confidence score is dynamic (20% per keyword matches max 100)', () => {
    // Has 3 'Account' keywords: password, login, account
    const result = analyzeTicket('I forgot my password to login to my account.');
    expect(result.category).toBe('Account');
    expect(result.priority).toBe('P2'); // No urgency, Technical/Account start at P2
    expect(result.confidence).toBe(0.60); // 3 keywords * 20 = 60%
  });

  test('Low confidence fallback', () => {
    const result = analyzeTicket('Hello, how are you doing today?');
    expect(result.category).toBe('Other');
    expect(result.priority).toBe('P3'); 
    expect(result.confidence).toBe(0.10); // fallback
  });
});
