import json

file_path = 'd:/ScoutIT/frontend/src/lib/mock-companies-v2.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

count = 0
for company in data:
    if company.get('name') == 'UST' and company.get('domain') == 'ustraveldocs.com':
        company['domain'] = 'ust.com'
        count += 1

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print(f"Successfully updated {count} UST domains in {file_path}")
