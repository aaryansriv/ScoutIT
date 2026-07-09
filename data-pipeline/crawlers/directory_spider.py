import scrapy
from scrapy_playwright.page import PageMethod
import json

class DirectorySpider(scrapy.Spider):
    name = "directory_spider"
    
    # Generic ATS / Directory listing endpoints can be added here
    # Example starting URLs could be generic job boards or directory lists.
    start_urls = [
        # Replace this with the target generic directory URL
        "https://example.com/companies?location=hyderabad"
    ]

    custom_settings = {
        "DOWNLOAD_HANDLERS": {
            "http": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
            "https": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
        },
        "TWISTED_REACTOR": "twisted.internet.asyncioreactor.AsyncioSelectorReactor",
        "PLAYWRIGHT_BROWSER_TYPE": "chromium",
        "PLAYWRIGHT_LAUNCH_OPTIONS": {
            "headless": True,
        },
        "ROBOTSTXT_OBEY": False,
        "CONCURRENT_REQUESTS": 2,
        "DOWNLOAD_DELAY": 3,
        "USER_AGENT": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                meta={
                    "playwright": True,
                    "playwright_include_page": True,
                    "playwright_page_methods": [
                        PageMethod("wait_for_selector", ".company-card", timeout=10000),
                    ],
                },
                callback=self.parse_directory
            )

    async def parse_directory(self, response):
        page = response.meta["playwright_page"]
        
        # In a real scenario, this matches the CSS structure of the directory
        companies = response.css(".company-card")
        
        for company in companies:
            name = company.css(".company-name::text").get(default="").strip()
            industry = company.css(".industry::text").get(default="").strip()
            employee_count_str = company.css(".employees::text").get(default="").strip()
            city = company.css(".location::text").get(default="").strip()
            website = company.css("a.website-link::attr(href)").get(default="").strip()
            
            if name:
                yield {
                    "name": name,
                    "industry": industry,
                    "employee_count": employee_count_str,
                    "city": city,
                    "website": website,
                    "data_source": ["scraped_directory"]
                }
                
        # Handle pagination
        next_page = response.css("a.next-page::attr(href)").get()
        if next_page:
            yield response.follow(
                next_page, 
                callback=self.parse_directory,
                meta={
                    "playwright": True,
                    "playwright_include_page": True,
                    "playwright_page_methods": [
                        PageMethod("wait_for_selector", ".company-card", timeout=10000),
                    ],
                }
            )

        await page.close()
