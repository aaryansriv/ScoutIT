import json

data = json.load(open('d:/ScoutIT/frontend/src/lib/mock-companies-v2.json','r',encoding='utf-8'))
lm = json.load(open('d:/ScoutIT/frontend/src/lib/landmarks.json','r',encoding='utf-8'))

print("=== Companies per city ===")
from collections import Counter
for city, cnt in Counter(c['city'] for c in data).most_common():
    print(f"  {city}: {cnt}")

print("\n=== Sample Hyderabad companies (location check) ===")
hyd = [c for c in data if c['city'] == 'Hyderabad']
for c in hyd[:10]:
    print(f"  {c['name']:30s} | {c['location_name']:30s} | ({c['lat']:.4f}, {c['lng']:.4f})")

print("\n=== Sample Bengaluru companies (location check) ===")
blr = [c for c in data if c['city'] == 'Bengaluru']
for c in blr[:10]:
    print(f"  {c['name']:30s} | {c['location_name']:30s} | ({c['lat']:.4f}, {c['lng']:.4f})")

print(f"\n=== Landmarks: {len(lm)} total ===")
for l in lm:
    print(f"  [{l['type']:10s}] {l['name']:30s} | {l['city']:12s} | ({l['lat']:.4f}, {l['lng']:.4f})")
