from playwright.sync_api import sync_playwright
import json
import re

def extract_content(url: str):
    if "instagram.com" in url:
        return scrape_instagram(url)
    
    # Fallback for blogs using trafilatura
    import trafilatura
    return {"raw_text": trafilatura.extract(trafilatura.fetch_url(url)) or "No content", "type": "article"}

def scrape_instagram(url: str):
    """Intercepts Instagram's internal JSON response to get the REAL caption."""
    with sync_playwright() as p:
        # Launch browser with stealth-like headers
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        # This list will catch the data
        instagram_data = {"caption": "", "hashtags": [], "media_url": ""}

        def handle_response(response):
            # We look for the 'graphql' or 'web_info' queries Instagram sends
            if "graphql/query" in response.url or "web_profile_info" in response.url:
                try:
                    data = response.json()
                    # Dive into the nested JSON to find the caption
                    items = data.get('data', {}).get('xdt_shortcode_media', {})
                    caption_text = items.get('edge_media_to_caption', {}).get('edges', [{}])[0].get('node', {}).get('text', "")
                    if caption_text:
                        instagram_data["caption"] = caption_text
                        instagram_data["hashtags"] = re.findall(r"#(\w+)", caption_text)
                        instagram_data["media_url"] = items.get('display_url', "")
                except:
                    pass

        # Listen to all network traffic
        page.on("response", handle_response)
        
        try:
            page.goto(url, wait_until="networkidle", timeout=30000)
            # If no JSON was caught, fallback to page text
            if not instagram_data["caption"]:
                instagram_data["caption"] = page.title()
        except Exception as e:
            print(f"Playwright Timeout/Error: {e}")
        
        browser.close()
        return {
            "raw_text": instagram_data["caption"],
            "hashtags": instagram_data["hashtags"],
            "media_url": instagram_data["media_url"],
            "type": "instagram"
        }