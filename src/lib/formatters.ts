export function formatNumberCompact(value: number | string, isCurrency = false, currencySymbol = ''): string {
  // Convert string to number if needed, preserving existing formatting if it's already a complex string
  let num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  
  // If it's not a valid number after parsing, return the original string
  if (isNaN(num)) {
    return String(value);
  }

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  // Less than 10,000: Display full number
  if (absNum < 10000) {
    let formatted = absNum.toLocaleString('en-US', { maximumFractionDigits: 2 });
    formatted = isNegative ? `-${formatted}` : formatted;
    return isCurrency ? `${currencySymbol}${formatted}` : formatted;
  }

  // Format using metric suffixes
  let compactValue = absNum;
  let suffix = '';

  if (absNum >= 1_000_000_000_000_000) {
    compactValue = absNum / 1_000_000_000_000_000;
    suffix = 'P';
  } else if (absNum >= 1_000_000_000_000) {
    compactValue = absNum / 1_000_000_000_000;
    suffix = 'T';
  } else if (absNum >= 1_000_000_000) {
    compactValue = absNum / 1_000_000_000;
    suffix = 'B';
  } else if (absNum >= 1_000_000) {
    compactValue = absNum / 1_000_000;
    suffix = 'M';
  } else if (absNum >= 10_000) {
    compactValue = absNum / 1000;
    suffix = 'K';
  }

  // Format to max 2 decimal places, but remove unnecessary trailing zeros
  // parseFloat handles the removal of trailing zeros after toFixed(2)
  const formattedCompact = parseFloat(compactValue.toFixed(2)).toString();
  
  const finalString = `${isNegative ? '-' : ''}${formattedCompact}${suffix}`;

  return isCurrency ? `${currencySymbol}${finalString}` : finalString;
}

export function isIdentifierOrPercentage(key: string, value: string | number): boolean {
  const lowerKey = key.toLowerCase();
  
  // Exclude percentages
  if (lowerKey.includes('percentage') || lowerKey.includes('rate') || lowerKey.includes('pct') || String(value).includes('%')) {
    return true;
  }
  
  // Exclude IDs
  if (lowerKey.endsWith('id') || lowerKey.startsWith('id_') || lowerKey === 'id' || lowerKey.includes('_id')) {
    return true;
  }
  
  // Exclude phone numbers, zip codes, coordinates, years
  if (
    lowerKey.includes('phone') || 
    lowerKey.includes('zip') || 
    lowerKey.includes('postal') ||
    lowerKey.includes('lat') ||
    lowerKey.includes('lon') ||
    lowerKey.includes('year') ||
    lowerKey.includes('date') ||
    lowerKey.includes('time') ||
    lowerKey.includes('barcode') ||
    lowerKey.includes('serial')
  ) {
    return true;
  }

  return false;
}

export function extractCurrency(value: string): { amount: number, symbol: string } | null {
  // Matches symbols like $, €, £, ¥, ₹, or standard abbreviations like PKR, USD, EUR optionally followed by space
  const currencyMatch = String(value).match(/^([$€£¥₹]|(?:PKR|USD|EUR|GBP|INR|Rs\.?)\s*)([\d,.-]+)$/i);
  
  if (currencyMatch) {
    const symbol = currencyMatch[1];
    const amountStr = currencyMatch[2];
    const amount = parseFloat(amountStr.replace(/,/g, ''));
    if (!isNaN(amount)) {
      return { amount, symbol };
    }
  }
  return null;
}

export function autoFormatValue(key: string, value: any): any {
  if (value === null || value === undefined) return value;
  
  // 1. Skip formatting if it's an identifier or percentage
  if (isIdentifierOrPercentage(key, value)) {
    return value;
  }

  // 2. Check if it's a string that contains a currency
  if (typeof value === 'string') {
    const currencyData = extractCurrency(value);
    if (currencyData) {
      return formatNumberCompact(currencyData.amount, true, currencyData.symbol);
    }
    
    // Check if it's purely a parseable number string but skipping dates/timestamps
    // Simple check: if it looks exactly like a number (no letters/dates)
    if (/^-?[\d,]+(\.\d+)?$/.test(value.trim())) {
       const parsed = parseFloat(value.replace(/,/g, ''));
       if (!isNaN(parsed) && Math.abs(parsed) >= 10000) {
         return formatNumberCompact(parsed);
       }
    }
    return value;
  }

  // 3. If it's a number, format it directly
  if (typeof value === 'number') {
    // If it's a small number, formatNumberCompact handles the < 10000 logic
    // but typically we don't need to touch it if we just want raw, but the spec says:
    // 0 - 9,999: Full number (e.g. 9,845). Meaning it should be converted to string with commas!
    return formatNumberCompact(value);
  }

  return value;
}
