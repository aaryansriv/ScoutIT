import json

FIXES = {
    "3i Infotech": "3i-infotech.com",  # this is actually the correct domain
    "TELUS Digital": "telusdigital.com",
    "HTC Global Services": "htcglobal.com",
    "AXA Global Business Services": "axa.com",
    "Sysnet Global Technologies": "sysnetglobal.com",
    "BA Continuum": "bacontinuum.com",
    "Sonata Software": "sonata-software.com",  # correct domain
    "Oracle Cerner": "oracle.com",
    "Slk Software Services": "slkgroup.com",
    "Zenith Computers": "zenithcomputersltd.com",
    "Mercedes-Benz Research and Development India": "mercedes-benz.com",  # already correct but has hyphen
}

path = 'd:/ScoutIT/frontend/src/lib/mock-companies-v2.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

fixed = 0
for c in data:
    if c['name'] in FIXES:
        c['domain'] = FIXES[c['name']]
        fixed += 1

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print(f"Fixed {fixed} domains.")
