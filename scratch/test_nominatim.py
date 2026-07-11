import asyncio
from data_pipeline.geocoding.nominatim_client import geocode_address, _query_nominatim

def test():
    queries = [
        ("UST", "Bengaluru"),
        ("UST", "Hyderabad"),
        ("TCS", "Bengaluru"),
        ("Accenture", "Hyderabad"),
        ("Google", "Bengaluru")
    ]
    for comp, city in queries:
        query = f"{comp}, {city}, India"
        print(f"Querying: {query}")
        # Public nominatim is 1 req/sec
        res = _query_nominatim("https://nominatim.openstreetmap.org", query, is_public=True)
        print(f"Result: {res}")
        import time
        time.sleep(1.2)

if __name__ == "__main__":
    test()
