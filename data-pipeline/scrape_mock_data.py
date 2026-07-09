import urllib.request
from bs4 import BeautifulSoup
import json
import random
import time
import re
import uuid

# Base coordinates for scattering companies
CITIES = {
    "Bengaluru": {"url": "bengaluru", "lat": 12.9716, "lng": 77.5946},
    "Noida": {"url": "noida", "lat": 28.5355, "lng": 77.3910},
    "Hyderabad": {"url": "hyderabad", "lat": 17.3850, "lng": 78.4867},
    "Pune": {"url": "pune", "lat": 18.5204, "lng": 73.8567},
    "Gurugram": {"url": "gurgaon", "lat": 28.4595, "lng": 77.0266}, # ambitionbox uses gurgaon
    "Mumbai": {"url": "mumbai", "lat": 19.0760, "lng": 72.8777},
    "Chennai": {"url": "chennai", "lat": 13.0827, "lng": 80.2707},
}

COMPANY_TYPES = ["product", "service", "startup", "mnc", "unicorn"]
TECH_STACK_POOL = [
    "React", "Node.js", "Python", "Java", "Go", "C++", "AWS", 
    "Docker", "Kubernetes", "Next.js", "TypeScript", "PostgreSQL",
    "MongoDB", "Redis", "Rust", "Ruby", "PHP", "Angular", "Vue", "Swift"
]
COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]

companies_data = []

def generate_slug(name):
    # Remove non-alphanumeric, convert to lower, replace spaces with hyphens
    slug = re.sub(r'[^a-zA-Z0-9\s]', '', name).strip().lower()
    return re.sub(r'\s+', '-', slug)

def generate_mock_company(name, city_name, base_lat, base_lng):
    # Random offset ~ 10-15km radius (0.1 degree roughly ~ 11km)
    lat_offset = random.uniform(-0.15, 0.15)
    lng_offset = random.uniform(-0.15, 0.15)
    
    num_techs = random.randint(2, 6)
    tech_stack = random.sample(TECH_STACK_POOL, num_techs)
    
    logo_initial = name[0].upper() if name else "C"
    # Special cases for logos (up to 3 chars)
    if " " in name:
        parts = name.split(" ")
        logo_initial = (parts[0][0] + (parts[1][0] if len(parts)>1 else "")).upper()
        if len(logo_initial) > 3: logo_initial = logo_initial[:3]
        
    return {
        "id": str(uuid.uuid4()),
        "name": name,
        "slug": generate_slug(name) + "-" + str(random.randint(1000, 9999)),
        "lat": base_lat + lat_offset,
        "lng": base_lng + lng_offset,
        "company_type": random.choice(COMPANY_TYPES),
        "hiring": random.choice([True, False, True]), # Bias towards true
        "logo_initial": logo_initial,
        "logo_color": random.choice(COLORS),
        "roles_count": random.randint(0, 150),
        "tech_stack": tech_stack,
        "location_name": f"{city_name} Hub",
        "city": city_name
    }

def scrape_city(city_name, city_info):
    url_city = city_info['url']
    print(f"\n--- Scraping {city_name} ---")
    
    for page in range(1, 11): # 10 pages per city (~300 max theoretically)
        url = f"https://www.ambitionbox.com/companies-in-{url_city}?page={page}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            html = urllib.request.urlopen(req).read()
            soup = BeautifulSoup(html, 'html.parser')
            
            headers = soup.find_all('h2')
            if not headers:
                print(f"No more companies found on page {page}.")
                break
                
            count = 0
            for h2 in headers:
                name = h2.text.strip()
                if not name or "Companies in" in name or "TCS" in name.upper():
                    continue
                
                comp_data = generate_mock_company(name, city_name, city_info['lat'], city_info['lng'])
                companies_data.append(comp_data)
                count += 1
                
            print(f"Page {page}: Extracted {count} companies.")
            time.sleep(0.5) # Be polite
        except Exception as e:
            print(f"Failed on page {page}: {e}")
            break

for city_name, city_info in CITIES.items():
    scrape_city(city_name, city_info)
    
print(f"\nTotal companies scraped: {len(companies_data)}")

# Save to JSON in the frontend
out_path = 'd:/ScoutIT/frontend/src/lib/mock-companies.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(companies_data, f, indent=2)

print(f"Saved to {out_path}")
