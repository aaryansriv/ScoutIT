import json
import os
import random
import re
import urllib.request
from bs4 import BeautifulSoup
import uuid

# Base coordinates for scattering companies in Hyderabad
HYDERABAD_LAT = 17.3850
HYDERABAD_LNG = 78.4867

# Dict of manual overrides for popular domains to avoid autocomplete matching errors (e.g. UST -> ustraveldocs)
DOMAIN_OVERRIDES = {
    "UST": "ust.com",
    "TCS": "tcs.com",
    "Accenture": "accenture.com",
    "Wipro": "wipro.com",
    "Cognizant": "cognizant.com",
    "Capgemini": "capgemini.com",
    "Infosys": "infosys.com",
    "HCLTech": "hcltech.com",
    "Tech Mahindra": "techmahindra.com",
    "LTM Limited": "ltimindtree.com",
    "L&T Infotech": "ltimindtree.com",
    "LTIMindtree": "ltimindtree.com",
    "IBM": "ibm.com",
    "WNS": "wns.com",
    "DXC Technology": "dxc.com",
    "Mphasis": "mphasis.com",
    "Coforge": "coforge.com",
    "Optum Global Solutions": "optum.com",
    "Hexaware Technologies": "hexaware.com",
    "L&T Technology Services": "ltts.com",
    "Oracle": "oracle.com",
    "eClerx": "eclerx.com",
    "Virtusa Consulting Services": "virtusa.com",
    "GlobalLogic": "globallogic.com",
    "Persistent Systems": "persistent.com",
    "ITC Infotech": "itcinfotech.com",
    "Nagarro": "nagarro.com",
    "Hewlett Packard Enterprise": "hpe.com",
    "Carelon Global Solutions": "carelon.com",
    "Publicis Sapient": "publicissapient.com",
    "Kyndryl": "kyndryl.com",
    "KPIT Technologies": "kpit.com"
}

COMPANY_TYPES = ["product", "service", "startup", "mnc", "unicorn"]
TECH_STACK_POOL = [
    "React", "Node.js", "Python", "Java", "Go", "C++", "AWS", 
    "Docker", "Kubernetes", "Next.js", "TypeScript", "PostgreSQL",
    "MongoDB", "Redis", "Rust", "Ruby", "PHP", "Angular", "Vue", "Swift"
]
COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]

def clean_slug(name):
    slug = re.sub(r'[^a-zA-Z0-9\s]', '', name).strip().lower()
    return re.sub(r'\s+', '-', slug)

def generate_logo_initials(name):
    parts = name.split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()[:2]
    return name[:2].upper() if name else "C"

def parse_html_content(html):
    soup = BeautifulSoup(html, 'html.parser')
    cards = soup.find_all("div", class_="companyCardWrapper")
    parsed_companies = []
    
    for card in cards:
        h2 = card.find("h2", class_="companyCardWrapper__companyName") or card.find("h2")
        if not h2:
            continue
        name = h2.text.strip()
        if not name or "Companies in" in name:
            continue
            
        # Extract rating
        rating = "3.5" # default
        rating_el = card.find("div", class_="companyCardWrapper__companyRating") or card.find("div", class_="rating_text")
        if rating_el:
            match = re.search(r'\b[1-5]\.[0-9]\b', rating_el.text)
            if match:
                rating = match.group(0)
                
        # Extract reviews/roles count
        reviews_match = re.search(r'([\d\.]+[kL]?)\s*Reviews', card.text, re.I)
        reviews = reviews_match.group(1) if reviews_match else "N/A"
        
        # Domain mapping
        domain = DOMAIN_OVERRIDES.get(name)
        if not domain:
            domain = clean_slug(name) + ".com"
            
        # Get industry from interlinking metadata
        industry = "product"
        meta_el = card.find("span", class_="companyCardWrapper__interLinking")
        if meta_el:
            meta_text = meta_el.text.strip().lower()
            if "service" in meta_text or "consulting" in meta_text:
                industry = "service"
            elif "product" in meta_text:
                industry = "product"
            else:
                industry = random.choice(COMPANY_TYPES)
        else:
            industry = random.choice(COMPANY_TYPES)
            
        # Generate full company object matching frontend schema
        lat_offset = random.uniform(-0.15, 0.15)
        lng_offset = random.uniform(-0.15, 0.15)
        
        num_techs = random.randint(2, 6)
        tech_stack = random.sample(TECH_STACK_POOL, num_techs)
        
        parsed_companies.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "slug": f"{clean_slug(name)}-{random.randint(1000, 9999)}",
            "lat": HYDERABAD_LAT + lat_offset,
            "lng": HYDERABAD_LNG + lng_offset,
            "company_type": industry if industry in COMPANY_TYPES else "product",
            "hiring": random.choice([True, False, True]), # Bias towards hiring
            "logo_initial": generate_logo_initials(name),
            "logo_color": random.choice(COLORS),
            "roles_count": random.randint(10, 150),
            "tech_stack": tech_stack,
            "location_name": "Hyderabad Hub",
            "city": "Hyderabad",
            "domain": domain
        })
        
    return parsed_companies

def run():
    print("Starting AmbitionBox Hyderabad scraper...")
    all_companies = []
    
    # Check if we can read from our pre-fetched local files from read_url_content
    local_files = [
        r"C:\Users\aarya\.gemini\antigravity-ide\brain\de07aecc-eb21-48b2-ae51-a3465cfdec97\.system_generated\steps\51\content.md",
        r"C:\Users\aarya\.gemini\antigravity-ide\brain\de07aecc-eb21-48b2-ae51-a3465cfdec97\.system_generated\steps\79\content.md",
        r"C:\Users\aarya\.gemini\antigravity-ide\brain\de07aecc-eb21-48b2-ae51-a3465cfdec97\.system_generated\steps\81\content.md",
        r"C:\Users\aarya\.gemini\antigravity-ide\brain\de07aecc-eb21-48b2-ae51-a3465cfdec97\.system_generated\steps\83\content.md",
        r"C:\Users\aarya\.gemini\antigravity-ide\brain\de07aecc-eb21-48b2-ae51-a3465cfdec97\.system_generated\steps\85\content.md",
        r"C:\Users\aarya\.gemini\antigravity-ide\brain\de07aecc-eb21-48b2-ae51-a3465cfdec97\.system_generated\steps\153\content.md",
        r"C:\Users\aarya\.gemini\antigravity-ide\brain\de07aecc-eb21-48b2-ae51-a3465cfdec97\.system_generated\steps\155\content.md",
    ]
    
    # We will also read from the actual HTML we downloaded earlier if it's there
    html_file = "d:/ScoutIT/scratch/page.html"
    
    use_fetched = True
    for lf in local_files:
        if not os.path.exists(lf):
            use_fetched = False
            break
            
    if use_fetched:
        print("Pre-fetched markdown contents found. Parsing them...")
        # Since these are markdown files with structure similar to html cards, 
        # let's extract them using simple string/regex parsing in python!
        for lf in local_files:
            print(f"Parsing pre-fetched file: {os.path.basename(lf)}")
            with open(lf, "r", encoding="utf-8") as f:
                content = f.read()
                
            # Regex to find headings and subsequent links
            # In the markdown content:
            # ## TCS
            # [1.2L Reviews](https://www.ambitionbox.com/reviews/tcs-reviews)
            # ...
            matches = re.finditer(r'##\s+([^\n]+)\n\[([\d\.]+[kL]?)\s+Reviews\]', content)
            count = 0
            for m in matches:
                name = m.group(1).strip()
                if "Companies in" in name or name == "Home":
                    continue
                reviews = m.group(2)
                
                # Domain lookup
                domain = DOMAIN_OVERRIDES.get(name)
                if not domain:
                    domain = clean_slug(name) + ".com"
                    
                # Let's decide company type (mix of product/service/startup/mnc/unicorn)
                # If name is in DOMAIN_OVERRIDES, it's a top company (MNC/unicorn)
                c_type = "service" if name in ["TCS", "Accenture", "Wipro", "Cognizant", "Capgemini", "Infosys", "HCLTech", "Tech Mahindra"] else random.choice(COMPANY_TYPES)
                
                lat_offset = random.uniform(-0.15, 0.15)
                lng_offset = random.uniform(-0.15, 0.15)
                
                num_techs = random.randint(2, 6)
                tech_stack = random.sample(TECH_STACK_POOL, num_techs)
                
                all_companies.append({
                    "id": str(uuid.uuid4()),
                    "name": name,
                    "slug": f"{clean_slug(name)}-{random.randint(1000, 9999)}",
                    "lat": HYDERABAD_LAT + lat_offset,
                    "lng": HYDERABAD_LNG + lng_offset,
                    "company_type": c_type,
                    "hiring": random.choice([True, False, True]),
                    "logo_initial": generate_logo_initials(name),
                    "logo_color": random.choice(COLORS),
                    "roles_count": random.randint(10, 150),
                    "tech_stack": tech_stack,
                    "location_name": "Hyderabad Hub",
                    "city": "Hyderabad",
                    "domain": domain
                })
                count += 1
            print(f"  Extracted {count} companies.")
    else:
        # Fallback to direct web scraping
        print("No pre-fetched files found. Fetching directly from AmbitionBox...")
        for page in range(1, 8):
            url = f"https://www.ambitionbox.com/list-of-companies?locations=hyderabad&sortBy=popular&industries=it-services-and-consulting,software-product&page={page}"
            try:
                print(f"Fetching Page {page}...")
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'})
                with urllib.request.urlopen(req) as response:
                    html = response.read()
                    parsed = parse_html_content(html)
                    all_companies.extend(parsed)
                    print(f"  Extracted {len(parsed)} companies.")
            except Exception as e:
                print(f"  Error on page {page}: {e}")
                
    # Deduplicate companies by name
    seen = set()
    unique_companies = []
    for c in all_companies:
        if c["name"] not in seen:
            seen.add(c["name"])
            unique_companies.append(c)
            
    print(f"Total unique Hyderabad companies parsed: {len(unique_companies)}")
    if not unique_companies:
        print("No companies parsed. Aborting.")
        return
        
    # Read existing mock-companies-v2.json
    out_path = 'd:/ScoutIT/frontend/src/lib/mock-companies-v2.json'
    if os.path.exists(out_path):
        with open(out_path, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
    else:
        existing_data = []
        
    # Remove existing Hyderabad companies
    non_hyd_companies = [c for c in existing_data if c.get("city") != "Hyderabad"]
    print(f"Removed {len(existing_data) - len(non_hyd_companies)} existing Hyderabad companies.")
    
    # Merge new Hyderabad companies
    merged_data = non_hyd_companies + unique_companies
    
    # Save back to mock-companies-v2.json
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(merged_data, f, indent=2)
        
    print(f"Successfully saved {len(merged_data)} companies to {out_path}.")

if __name__ == "__main__":
    run()
