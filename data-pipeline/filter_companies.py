import json
import re

input_path = 'd:/ScoutIT/frontend/src/lib/mock-companies.json'
output_path = 'd:/ScoutIT/frontend/src/lib/mock-companies.json'

with open(input_path, 'r', encoding='utf-8') as f:
    companies = json.load(f)

# Keywords indicating non-IT companies
BAD_KEYWORDS = [
    r'\bbank\b', r'\bfinance\b', r'\bcapital\b', r'\binsurance\b', 
    r'\bcredit\b', r'\bcard[s]?\b', r'\binvestment\b', r'\bwealth\b', 
    r'\bholdings\b', r'\bgroup\b', r'\bfund\b', r'\bequity\b',
    r'\bloan\b', r'\bmicrofinance\b', r'\bfinancial\b', r'\bbanking\b'
]
bad_pattern = re.compile('|'.join(BAD_KEYWORDS), re.IGNORECASE)

filtered = []
for c in companies:
    if not bad_pattern.search(c['name']):
        filtered.append(c)

print(f"Original count: {len(companies)}")
print(f"Filtered count: {len(filtered)}")
print(f"Removed: {len(companies) - len(filtered)}")

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(filtered, f, indent=2)

print("Filtering complete.")
