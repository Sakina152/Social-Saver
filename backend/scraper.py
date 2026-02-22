from playwright.sync_api import sync_playwright
import json
import re

def extract_content(url: str):
    if "instagram.com" in url:
        return scrape_instagram(url)
    
    import trafilatura
    return {"raw_text": trafilatura.extract(trafilatura.fetch_url(url)) or "No content", "type": "article"}

def scrape_instagram(url: str):
    """Intercepts Instagram's internal JSON response to get the REAL data."""
    with sync_playwright() as p:
        # Launch browser with human-like arguments
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        # State to store captured data
        ig_data = {"caption": "", "hashtags": [], "media_url": ""}

        # Function to catch the JSON response from Instagram's API
        def handle_response(response):
            # Target common GraphQL and profile info endpoints
            if any(x in response.url for x in ["graphql/query", "web_profile_info"]):
                try:
                    data = response.json()
                    # Drill into the JSON structure for a post/reel
                    media = data.get('data', {}).get('xdt_shortcode_media', {})
                    caption_edges = media.get('edge_media_to_caption', {}).get('edges', [])
                    
                    if caption_edges:
                        caption_text = caption_edges[0].get('node', {}).get('text', "")
                        if caption_text:
                            ig_data["caption"] = caption_text
                            ig_data["hashtags"] = re.findall(r"#(\w+)", caption_text)
                            ig_data["media_url"] = media.get('display_url', "")
                except:
                    pass

        # Attach the listener
        page.on("response", handle_response)
        
        try:
            # wait_until="networkidle" is key—it waits for the data to finish loading
            page.goto(url, wait_until="networkidle", timeout=30000)
            
            # Fallback: Scrape the Meta tags if the API call was missed
            if not ig_data["caption"]:
                meta_desc = page.locator('meta[property="og:description"]').get_attribute("content")
                if meta_desc:
                    ig_data["caption"] = meta_desc
                    ig_data["hashtags"] = re.findall(r"#(\w+)", meta_desc)
        except Exception as e:
            print(f"Playwright error: {e}")
        
        browser.close()
        return {
            "raw_text": ig_data["caption"] or "No caption found",
            "hashtags": ig_data["hashtags"],
            "media_url": ig_data["media_url"],
            "type": "instagram"
        }