"""
Fix company coordinates across ALL cities by assigning them to known IT hubs/tech parks
instead of random jitter around city center. Also generates landmarks JSON.
"""

import json
import random
import uuid

# ─── Known IT Hub zones per city ──────────────────────────────────────────────
# Each hub is (name, lat, lng) — companies get distributed across these with tiny jitter

IT_HUBS = {
    "Hyderabad": [
        ("HITEC City", 17.4435, 78.3772),
        ("Gachibowli", 17.4401, 78.3489),
        ("Madhapur", 17.4486, 78.3908),
        ("Financial District", 17.4225, 78.3450),
        ("Nanakramguda", 17.4156, 78.3807),
        ("Kondapur", 17.4603, 78.3548),
        ("Begumpet", 17.4439, 78.4720),
        ("Banjara Hills", 17.4138, 78.4472),
        ("Kukatpally", 17.4947, 78.3996),
        ("Uppal", 17.4006, 78.5592),
        ("Raidurg", 17.4270, 78.3860),
        ("Miyapur", 17.4967, 78.3538),
        ("Manikonda", 17.4050, 78.3880),
    ],
    "Bengaluru": [
        ("Electronic City Phase 1", 12.8450, 77.6600),
        ("Whitefield", 12.9698, 77.7500),
        ("Manyata Tech Park", 13.0472, 77.6217),
        ("Outer Ring Road, Marathahalli", 12.9562, 77.7013),
        ("Koramangala", 12.9352, 77.6245),
        ("Hebbal", 13.0358, 77.5970),
        ("Bannerghatta Road", 12.8898, 77.5968),
        ("Sarjapur Road", 12.9100, 77.6860),
        ("Bellandur", 12.9258, 77.6763),
        ("Indiranagar", 12.9719, 77.6412),
        ("HSR Layout", 12.9116, 77.6389),
        ("JP Nagar", 12.9063, 77.5857),
        ("Yeswanthpur", 13.0238, 77.5450),
    ],
    "Noida": [
        ("Sector 62", 28.6267, 77.3650),
        ("Sector 63", 28.6225, 77.3770),
        ("Sector 125", 28.5445, 77.3231),
        ("Sector 16", 28.5818, 77.3116),
        ("Sector 135 Expressway", 28.5095, 77.3907),
        ("Sector 44", 28.5732, 77.3508),
        ("Sector 18", 28.5700, 77.3219),
        ("Sector 15", 28.5855, 77.3136),
        ("Knowledge Park, Greater Noida", 28.4678, 77.4918),
        ("Sector 126", 28.5400, 77.3300),
        ("Sector 128", 28.5170, 77.3360),
        ("Sector 132", 28.5028, 77.3715),
    ],
    "Pune": [
        ("Hinjewadi Phase 1", 18.5912, 73.7390),
        ("Hinjewadi Phase 2", 18.5870, 73.7180),
        ("Kharadi", 18.5526, 73.9400),
        ("Magarpatta City", 18.5135, 73.9270),
        ("Baner", 18.5598, 73.7868),
        ("Viman Nagar", 18.5679, 73.9143),
        ("Hadapsar", 18.5089, 73.9260),
        ("Aundh", 18.5590, 73.8070),
        ("Wakad", 18.5982, 73.7614),
        ("Kalyani Nagar", 18.5474, 73.9040),
        ("Yerwada", 18.5562, 73.8870),
        ("Shivajinagar", 18.5308, 73.8474),
    ],
    "Chennai": [
        ("OMR Sholinganallur", 12.9010, 80.2279),
        ("Siruseri SIPCOT IT Park", 12.8267, 80.2200),
        ("Guindy", 13.0067, 80.2206),
        ("Tidel Park, Taramani", 12.9850, 80.2430),
        ("Perungudi", 12.9620, 80.2420),
        ("Anna Salai", 13.0569, 80.2545),
        ("Porur", 13.0382, 80.1569),
        ("Ambattur", 13.1143, 80.1548),
        ("Thoraipakkam", 12.9357, 80.2323),
        ("Kandanchavadi", 12.9580, 80.2360),
        ("Velachery", 12.9788, 80.2186),
        ("Nungambakkam", 13.0608, 80.2440),
    ],
    "Mumbai": [
        ("BKC, Bandra", 19.0596, 72.8656),
        ("Andheri East", 19.1136, 72.8697),
        ("Lower Parel", 18.9958, 72.8284),
        ("Powai", 19.1176, 72.9060),
        ("Goregaon East", 19.1663, 72.8526),
        ("Malad West", 19.1868, 72.8484),
        ("Airoli, Navi Mumbai", 19.1590, 72.9988),
        ("Vikhroli", 19.0926, 72.9259),
        ("Worli", 19.0176, 72.8150),
        ("Thane", 19.2183, 72.9781),
        ("Vashi, Navi Mumbai", 19.0771, 72.9986),
        ("Kurla", 19.0726, 72.8793),
    ],
    "Gurugram": [
        ("Cyber City, DLF Phase 2", 28.4945, 77.0885),
        ("DLF Phase 3", 28.4944, 77.0930),
        ("Sohna Road", 28.4279, 77.0540),
        ("Sector 44", 28.4515, 77.0677),
        ("Golf Course Road", 28.4599, 77.0990),
        ("Udyog Vihar Phase 4", 28.5028, 77.0856),
        ("Sector 29", 28.4684, 77.0625),
        ("MG Road", 28.4790, 77.0860),
        ("Sector 48", 28.4330, 77.0460),
        ("Sector 21", 28.4860, 77.0680),
        ("Sector 15", 28.4729, 77.0479),
        ("Manesar", 28.3567, 76.9393),
    ],
}

# ─── Famous Landmarks per city ─────────────────────────────────────────────

LANDMARKS = {
    "Hyderabad": [
        {"name": "Charminar", "type": "historical", "lat": 17.3616, "lng": 78.4747, "description": "Iconic 16th-century monument and mosque"},
        {"name": "Golconda Fort", "type": "historical", "lat": 17.3833, "lng": 78.4011, "description": "Medieval fortified citadel, capital of Qutb Shahi dynasty"},
        {"name": "Hussain Sagar Lake", "type": "landmark", "lat": 17.4239, "lng": 78.4738, "description": "Heart-shaped artificial lake with Buddha statue"},
        {"name": "Salar Jung Museum", "type": "historical", "lat": 17.3713, "lng": 78.4804, "description": "One of the largest one-man art museums in the world"},
        {"name": "Inorbit Mall", "type": "mall", "lat": 17.4352, "lng": 78.3879, "description": "Major shopping mall in HITEC City"},
        {"name": "Forum Sujana Mall", "type": "mall", "lat": 17.4451, "lng": 78.3614, "description": "Shopping and entertainment hub in Kukatpally"},
        {"name": "GVK One Mall", "type": "mall", "lat": 17.4238, "lng": 78.4534, "description": "Premium mall on Banjara Hills Road No. 1"},
        {"name": "Ramoji Film City", "type": "landmark", "lat": 17.2543, "lng": 78.6808, "description": "World's largest integrated film studio complex"},
    ],
    "Bengaluru": [
        {"name": "Bangalore Palace", "type": "historical", "lat": 12.9988, "lng": 77.5921, "description": "Tudor-style palace built in 1878"},
        {"name": "Tipu Sultan's Summer Palace", "type": "historical", "lat": 12.9593, "lng": 77.5737, "description": "18th-century Indo-Islamic architecture"},
        {"name": "Vidhana Soudha", "type": "historical", "lat": 12.9796, "lng": 77.5907, "description": "Seat of the Karnataka state legislature"},
        {"name": "Lalbagh Botanical Garden", "type": "landmark", "lat": 12.9507, "lng": 77.5848, "description": "Historic botanical garden with Glass House"},
        {"name": "Phoenix Marketcity", "type": "mall", "lat": 12.9967, "lng": 77.6469, "description": "Massive mall on Whitefield Road"},
        {"name": "Orion Mall", "type": "mall", "lat": 12.9914, "lng": 77.5579, "description": "Premium mall at Brigade Gateway, Rajajinagar"},
        {"name": "UB City Mall", "type": "mall", "lat": 12.9716, "lng": 77.5967, "description": "India's first luxury mall on Vittal Mallya Road"},
        {"name": "Forum Mall, Koramangala", "type": "mall", "lat": 12.9346, "lng": 77.6105, "description": "Popular lifestyle mall in Koramangala"},
    ],
    "Noida": [
        {"name": "Akshardham Temple", "type": "historical", "lat": 28.6127, "lng": 77.2773, "description": "Swaminarayan Akshardham cultural complex"},
        {"name": "Worlds of Wonder", "type": "landmark", "lat": 28.5679, "lng": 77.3262, "description": "Amusement and water park in Sector 38A"},
        {"name": "Noida Botanical Garden", "type": "landmark", "lat": 28.5602, "lng": 77.3473, "description": "Green park in Sector 38"},
        {"name": "DLF Mall of India", "type": "mall", "lat": 28.5677, "lng": 77.3217, "description": "One of the largest malls in India, Sector 18"},
        {"name": "The Great India Place", "type": "mall", "lat": 28.5681, "lng": 77.3224, "description": "Major shopping mall near Sector 18 metro"},
        {"name": "Logix City Centre", "type": "mall", "lat": 28.5724, "lng": 77.3258, "description": "Shopping center in Sector 32"},
        {"name": "Atta Market", "type": "landmark", "lat": 28.5810, "lng": 77.3346, "description": "Famous street market and food hub"},
    ],
    "Pune": [
        {"name": "Shaniwar Wada", "type": "historical", "lat": 18.5195, "lng": 73.8553, "description": "Historic Peshwa palace fortress from 1732"},
        {"name": "Aga Khan Palace", "type": "historical", "lat": 18.5525, "lng": 73.9016, "description": "Historical palace, Mahatma Gandhi memorial"},
        {"name": "Sinhagad Fort", "type": "historical", "lat": 18.3664, "lng": 73.7555, "description": "Hill fortress with Maratha history"},
        {"name": "Dagdusheth Halwai Temple", "type": "historical", "lat": 18.5166, "lng": 73.8556, "description": "Famous Ganpati temple in the heart of Pune"},
        {"name": "Phoenix Marketcity Pune", "type": "mall", "lat": 18.5604, "lng": 73.9160, "description": "Premium mall in Viman Nagar"},
        {"name": "Seasons Mall", "type": "mall", "lat": 18.5062, "lng": 73.9370, "description": "Large mall in Magarpatta City"},
        {"name": "Amanora Mall", "type": "mall", "lat": 18.5206, "lng": 73.9360, "description": "Shopping center in Hadapsar"},
        {"name": "Westend Mall", "type": "mall", "lat": 18.5575, "lng": 73.7832, "description": "Popular mall in Aundh"},
    ],
    "Chennai": [
        {"name": "Fort St. George", "type": "historical", "lat": 13.0798, "lng": 80.2868, "description": "First English fortress in India, built 1644"},
        {"name": "Kapaleeshwarar Temple", "type": "historical", "lat": 13.0339, "lng": 80.2695, "description": "7th-century Dravidian-architecture Shiva temple"},
        {"name": "Marina Beach", "type": "landmark", "lat": 13.0500, "lng": 80.2824, "description": "India's longest urban beach (13 km)"},
        {"name": "Mahabalipuram Shore Temple", "type": "historical", "lat": 12.6166, "lng": 80.1993, "description": "UNESCO World Heritage Site, 8th century"},
        {"name": "Phoenix Marketcity Chennai", "type": "mall", "lat": 12.9961, "lng": 80.2195, "description": "Largest mall in Chennai, Velachery"},
        {"name": "Express Avenue", "type": "mall", "lat": 13.0606, "lng": 80.2644, "description": "Premium mall on Whites Road"},
        {"name": "VR Chennai", "type": "mall", "lat": 13.0102, "lng": 80.2227, "description": "Luxury mall in Anna Nagar"},
        {"name": "Forum Vijaya Mall", "type": "mall", "lat": 13.0479, "lng": 80.2127, "description": "Popular mall on Arcot Road, Vadapalani"},
    ],
    "Mumbai": [
        {"name": "Gateway of India", "type": "historical", "lat": 18.9220, "lng": 72.8347, "description": "Iconic arch monument built in 1924"},
        {"name": "Chhatrapati Shivaji Terminus", "type": "historical", "lat": 18.9398, "lng": 72.8354, "description": "UNESCO heritage Victorian-Gothic railway station"},
        {"name": "Elephanta Caves", "type": "historical", "lat": 18.9633, "lng": 72.9315, "description": "UNESCO rock-cut cave temples on Elephanta Island"},
        {"name": "Marine Drive", "type": "landmark", "lat": 18.9432, "lng": 72.8234, "description": "Iconic 3.6 km promenade along the Arabian Sea"},
        {"name": "Phoenix Palladium", "type": "mall", "lat": 18.9960, "lng": 72.8287, "description": "Premium luxury mall in Lower Parel"},
        {"name": "R City Mall", "type": "mall", "lat": 19.0944, "lng": 72.9255, "description": "One of the largest malls in Mumbai, Ghatkopar"},
        {"name": "Inorbit Mall Malad", "type": "mall", "lat": 19.1872, "lng": 72.8396, "description": "Major shopping mall in Malad West"},
        {"name": "Infiniti Mall Andheri", "type": "mall", "lat": 19.1368, "lng": 72.8264, "description": "Popular mall in Andheri West"},
    ],
    "Gurugram": [
        {"name": "Kingdom of Dreams", "type": "landmark", "lat": 28.4691, "lng": 77.0680, "description": "India's first live entertainment destination"},
        {"name": "Sultanpur Bird Sanctuary", "type": "landmark", "lat": 28.4672, "lng": 76.8889, "description": "National park and bird sanctuary"},
        {"name": "Qutub Minar (nearby)", "type": "historical", "lat": 28.5245, "lng": 77.1855, "description": "UNESCO heritage minaret, world's tallest brick tower"},
        {"name": "Sheetla Mata Mandir", "type": "historical", "lat": 28.4750, "lng": 77.0390, "description": "Ancient Sheetla Devi temple, city's oldest shrine"},
        {"name": "Ambience Mall", "type": "mall", "lat": 28.5043, "lng": 77.0968, "description": "India's largest mall on NH-48"},
        {"name": "MGF Metropolitan Mall", "type": "mall", "lat": 28.4790, "lng": 77.0855, "description": "Premium mall on MG Road"},
        {"name": "DLF Mega Mall", "type": "mall", "lat": 28.4824, "lng": 77.0931, "description": "Major shopping center in DLF Phase 1"},
        {"name": "Galaxy Mall", "type": "mall", "lat": 28.4510, "lng": 77.0645, "description": "Entertainment and shopping hub in Sector 44"},
    ],
}


def run():
    file_path = 'd:/ScoutIT/frontend/src/lib/mock-companies-v2.json'
    
    print("Loading mock-companies-v2.json...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Loaded {len(data)} companies.")
    
    # ─── Fix coordinates for each company ──────────────────────────
    fixed_count = 0
    for company in data:
        city = company.get("city", "")
        if city in IT_HUBS:
            hubs = IT_HUBS[city]
            # Pick a random hub
            hub_name, hub_lat, hub_lng = random.choice(hubs)
            # Add small jitter: ~200-400m radius (0.002-0.004 degrees)
            jitter_lat = random.uniform(-0.004, 0.004)
            jitter_lng = random.uniform(-0.004, 0.004)
            company["lat"] = round(hub_lat + jitter_lat, 6)
            company["lng"] = round(hub_lng + jitter_lng, 6)
            company["location_name"] = hub_name
            fixed_count += 1
    
    print(f"Fixed coordinates for {fixed_count} companies across {len(IT_HUBS)} cities.")
    
    # ─── Save updated companies ────────────────────────────────────
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print(f"Saved updated {file_path}")
    
    # ─── Generate landmarks JSON ───────────────────────────────────
    landmarks_out = []
    for city, landmarks in LANDMARKS.items():
        for lm in landmarks:
            landmarks_out.append({
                "id": str(uuid.uuid4()),
                "name": lm["name"],
                "city": city,
                "type": lm["type"],  # "historical", "mall", "landmark"
                "lat": lm["lat"],
                "lng": lm["lng"],
                "description": lm["description"],
            })
    
    landmarks_path = 'd:/ScoutIT/frontend/src/lib/landmarks.json'
    with open(landmarks_path, 'w', encoding='utf-8') as f:
        json.dump(landmarks_out, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(landmarks_out)} landmarks to {landmarks_path}")
    
    # ─── Summary ───────────────────────────────────────────────────
    from collections import Counter
    city_counts = Counter(c["city"] for c in data)
    print("\nCompanies per city:")
    for city, count in city_counts.most_common():
        print(f"  {city}: {count}")
    print(f"\nLandmarks per city:")
    lm_counts = Counter(lm["city"] for lm in landmarks_out)
    for city, count in lm_counts.most_common():
        print(f"  {city}: {count}")


if __name__ == "__main__":
    run()
