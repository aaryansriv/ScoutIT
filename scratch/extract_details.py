from bs4 import BeautifulSoup
import re

with open("d:/ScoutIT/scratch/page.html", "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

cards = soup.find_all("div", class_="companyCardWrapper")
if cards:
    card = cards[0]
    rating_wrapper = card.find(class_=re.compile("companyRating", re.I))
    if rating_wrapper:
        print("Rating Wrapper HTML:")
        print(rating_wrapper.prettify())
        print("Rating Wrapper Text:", rating_wrapper.text.strip())
        
    for child in card.descendants:
        if child.name and child.get("class"):
            classes = child.get("class")
            print(f"Child Tag: {child.name}, Classes: {classes}, Text: {child.text.strip()}")
