from bs4 import BeautifulSoup

with open("d:/ScoutIT/scratch/page.html", "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

cards = soup.find_all("div", class_="companyCardWrapper")
print(f"Found {len(cards)} company cards.")

if cards:
    card = cards[0]
    print("\n--- Card HTML Structure ---")
    # Print a clean representation of the first card
    h2 = card.find("h2")
    print("H2 text:", h2.text.strip() if h2 else "N/A")
    
    rating = card.find("span", class_="companyCardWrapper__companyRating")
    print("Rating:", rating.text.strip() if rating else "N/A")
    
    # Check tags / details in the card
    meta = card.find("div", class_="companyCardWrapper__metaInformation")
    if meta:
        print("Meta tags:")
        for span in meta.find_all("span"):
            print("  - span:", span.text.strip())
            
    # Check services/industries/description
    desc = card.find("p", class_="companyCardWrapper__companyDescription")
    if desc:
        print("Description:", desc.text.strip())
    else:
        # Check all paragraphs
        print("All paragraphs in card:")
        for p in card.find_all("p"):
            print("  - p:", p.text.strip())

    # Let's dump all text from the card
    print("\nAll text inside card:")
    print(card.text.strip())
