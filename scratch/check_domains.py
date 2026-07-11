import json

data = json.load(open('d:/ScoutIT/frontend/src/lib/mock-companies-v2.json','r',encoding='utf-8'))

# Check how many Hyderabad companies have auto-generated domains (slug + .com)
hyd = [c for c in data if c['city'] == 'Hyderabad']
print(f"Hyderabad companies: {len(hyd)}")

auto_domain = []
for c in hyd:
    d = c.get('domain', '')
    # If the domain looks auto-generated (no dots except the .com)
    if d and '.' in d:
        parts = d.replace('.com', '')
        if '-' in parts:  # slug-style domains are auto-generated
            auto_domain.append(c)

print(f"Companies with auto-generated domains: {len(auto_domain)}")
for c in auto_domain[:15]:
    print(f"  {c['name']:35s} -> {c['domain']}")
