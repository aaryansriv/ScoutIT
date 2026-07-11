import json

# Actual prominent IT hubs for major MNCs in these cities
COMPANY_OFFICES = {
    "UST": {
        "Bengaluru": ("Outer Ring Road", 12.9562, 77.7013),
        "Noida": ("Sector 62", 28.6267, 77.3650),
        "Hyderabad": ("HITEC City", 17.4435, 78.3772),
        "Pune": ("Hinjewadi", 18.5912, 73.7390),
        "Chennai": ("OMR Sholinganallur", 12.9010, 80.2279),
        "Mumbai": ("Andheri East", 19.1136, 72.8697),
        "Gurugram": ("Cyber City", 28.4945, 77.0885),
    },
    "TCS": {
        "Bengaluru": ("Electronic City Phase 1", 12.8450, 77.6600),
        "Noida": ("Sector 62", 28.6267, 77.3650),
        "Hyderabad": ("Madhapur", 17.4486, 78.3908),
        "Pune": ("Hinjewadi Phase 3", 18.5870, 73.7180),
        "Chennai": ("Siruseri SIPCOT", 12.8267, 80.2200),
        "Mumbai": ("Powai", 19.1176, 72.9060),
        "Gurugram": ("Sector 29", 28.4684, 77.0625),
    },
    "Infosys": {
        "Bengaluru": ("Electronic City Phase 1", 12.8450, 77.6600),
        "Noida": ("Sector 62", 28.6267, 77.3650),
        "Hyderabad": ("Gachibowli", 17.4401, 78.3489),
        "Pune": ("Hinjewadi Phase 2", 18.5870, 73.7180),
        "Chennai": ("OMR Sholinganallur", 12.9010, 80.2279),
        "Mumbai": ("BKC", 19.0596, 72.8656),
        "Gurugram": ("Cyber City", 28.4945, 77.0885),
    },
    "Accenture": {
        "Bengaluru": ("Outer Ring Road, Marathahalli", 12.9562, 77.7013),
        "Noida": ("Sector 135", 28.5095, 77.3907),
        "Hyderabad": ("HITEC City", 17.4435, 78.3772),
        "Pune": ("Magarpatta City", 18.5135, 73.9270),
        "Chennai": ("Tidel Park, Taramani", 12.9850, 80.2430),
        "Mumbai": ("Airoli", 19.1590, 72.9988),
        "Gurugram": ("Udyog Vihar", 28.5028, 77.0856),
    }
}

path = 'd:/ScoutIT/frontend/src/lib/mock-companies-v2.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

fixed = 0
for c in data:
    name = c['name']
    city = c['city']
    if name in COMPANY_OFFICES and city in COMPANY_OFFICES[name]:
        loc_name, lat, lng = COMPANY_OFFICES[name][city]
        c['location_name'] = loc_name
        c['lat'] = lat
        c['lng'] = lng
        fixed += 1

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print(f"Fixed {fixed} manual override locations for prominent companies.")
