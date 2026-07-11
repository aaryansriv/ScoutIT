import urllib.request

url = "https://www.ambitionbox.com/list-of-companies?locations=hyderabad&sortBy=popular&industries=it-services-and-consulting,software-product"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read()
        with open("d:/ScoutIT/scratch/page.html", "wb") as f:
            f.write(html)
        print("Saved page HTML.")
except Exception as e:
    print("Error:", e)
