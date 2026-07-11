import json
import httpx
import time
from collections import defaultdict
import random

IT_HUBS = {
    "Hyderabad": [("HITEC City", 17.4435, 78.3772), ("Gachibowli", 17.4401, 78.3489), ("Madhapur", 17.4486, 78.3908)],
    "Bengaluru": [("Electronic City Phase 1", 12.8450, 77.6600), ("Whitefield", 12.9698, 77.7500), ("Manyata Tech Park", 13.0472, 77.6217), ("Outer Ring Road", 12.9562, 77.7013)],
    "Noida": [("Sector 62", 28.6267, 77.3650), ("Sector 125", 28.5445, 77.3231)],
    "Pune": [("Hinjewadi", 18.5912, 73.7390), ("Kharadi", 18.5526, 73.9400), ("Magarpatta", 18.5135, 73.9270)],
    "Chennai": [("OMR Sholinganallur", 12.9010, 80.2279), ("Siruseri SIPCOT", 12.8267, 80.2200), ("Tidel Park", 12.9850, 80.2430)],
    "Mumbai": [("BKC", 19.0596, 72.8656), ("Andheri East", 19.1136, 72.8697), ("Powai", 19.1176, 72.9060), ("Airoli", 19.1590, 72.9988)],
    "Gurugram": [("Cyber City", 28.4945, 77.0885), ("Udyog Vihar", 28.5028, 77.0856), ("Golf Course Road", 28.4599, 77.0990)]
}

def get_nominatim_coords(company_name, city):
    query = f"{company_name}, {city}, India"
    url = "https://nominatim.openstreetmap.org/search"
    headers = {"User-Agent": "ScoutIT/2.0 (geocoding@scoutit.in)"}
    params = {"q": query, "format": "json", "limit": 1}
    
    try:
        r = httpx.get(url, params=params, headers=headers, timeout=10)
        r.raise_for_status()
        data = r.json()
        if data:
            # We want to extract the display_name or a shortened version of it
            display_name = data[0].get("display_name", "")
            # Try to get the locality or road from the display name
            parts = [p.strip() for p in display_name.split(",")]
            location_name = parts[0] if len(parts) > 0 else f"{city} Office"
            if company_name.lower() in location_name.lower() and len(parts) > 1:
                location_name = parts[1]
                
            return float(data[0]["lat"]), float(data[0]["lon"]), location_name
    except Exception as e:
        pass
    return None, None, None

def main():
    path = 'd:/ScoutIT/frontend/src/lib/mock-companies-v2.json'
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    print(f"Loaded {len(data)} companies")
    
    # We want to avoid querying the exact same name/city multiple times if there are duplicates (though our dataset has 1 per city)
    # Since public API is 1 req/sec, we can't query 1043 companies. It would take 20 minutes!
    # Instead of querying ALL 1043, we'll try to use a local fallback logic.
    # Actually, 1043 seconds is 17 minutes. That's too long.
    
    # Wait, if we use Nominatim for just the top 20 companies globally across the 7 cities, 
    # it's 140 queries (2.5 mins). 
    
    # Let's count company frequencies to find the top ones
    counts = defaultdict(int)
    for c in data:
        counts[c['name']] += 1
        
    # Top 30 most common companies in the dataset
    top_companies = [name for name, _ in sorted(counts.items(), key=lambda x: -x[1])[:30]]
    print(f"Geocoding top {len(top_companies)} companies...")
    
    geocoded = 0
    cache = {}
    
    for i, c in enumerate(data):
        if c['name'] in top_companies:
            key = f"{c['name']}_{c['city']}"
            if key not in cache:
                lat, lng, loc = get_nominatim_coords(c['name'], c['city'])
                time.sleep(1.2)  # rate limit
                if lat:
                    cache[key] = (lat, lng, loc)
                else:
                    cache[key] = None
                    
            if cache[key]:
                lat, lng, loc = cache[key]
                c['lat'] = lat
                c['lng'] = lng
                c['location_name'] = loc
                geocoded += 1
                print(f"Geocoded: {c['name']} in {c['city']} -> {loc} ({lat}, {lng})")
        else:
            # For the rest, we ensure they have a reasonable IT hub name that sounds good
            if c['city'] in IT_HUBS:
                hub_name, h_lat, h_lng = random.choice(IT_HUBS[c['city']])
                c['lat'] = h_lat + random.uniform(-0.005, 0.005)
                c['lng'] = h_lng + random.uniform(-0.005, 0.005)
                c['location_name'] = hub_name
                
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
        
    print(f"\nDone! Successfully real-geocoded {geocoded} offices.")

if __name__ == "__main__":
    main()
