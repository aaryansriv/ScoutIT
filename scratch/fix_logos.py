import json

# Manual logo overrides for companies that get bad/wrong logos from Google Favicons
LOGO_OVERRIDES = {
    "UST": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/UST_logo.svg/512px-UST_logo.svg.png"
}

path = 'd:/ScoutIT/frontend/src/lib/mock-companies-v2.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

fixed = 0
for c in data:
    if c['name'] in LOGO_OVERRIDES:
        c['logo_url'] = LOGO_OVERRIDES[c['name']]
        fixed += 1

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print(f"Added custom logo override for {fixed} companies.")
