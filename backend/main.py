from fastapi import FastAPI, Request, BackgroundTasks
from database import get_db
from scraper import extract_content
from processor import analyze_content
import datetime
import uvicorn

# 1. Initialize the FastAPI app (This fixes the 'Attribute app not found' error)
app = FastAPI()

# 2. Connect to MongoDB
db = get_db()

def process_link_pipeline(url: str, doc_id):
    """
    Background task that handles the heavy lifting:
    Scraping, AI Analysis, and Database Update.
    """
    try:
        print(f"🔄 Processing: {url}")
        
        # Step A: Extract Content using Playwright
        extracted = extract_content(url)
        
        # Step B: AI Analysis using Gemini 2.5 Flash
        ai_result = analyze_content(extracted['raw_text'], url)
        
        # Step C: Update the MongoDB document with the 'Real' data
        db.bookmarks.update_one(
            {"_id": doc_id},
            {
                "$set": {
                    "category": ai_result.get('category', 'Uncategorized'),
                    "summary": ai_result.get('summary', 'No summary available'),
                    "explainability": ai_result.get('reason', ''),
                    "hashtags": extracted.get('hashtags', []) or ai_result.get('hashtags', []),
                    "media_url": extracted.get('media_url', ""),
                    "status": "processed"
                }
            }
        )
        print(f"✅ Successfully processed and saved to Dashboard!")
        
    except Exception as e:
        print(f"❌ Error in pipeline: {e}")
        db.bookmarks.update_one({"_id": doc_id}, {"$set": {"status": "error"}})

@app.post("/webhook")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Receives JSON data from the Node.js WhatsApp bot.
    """
    try:
        data = await request.json()
        url = data.get("url")
        sender = data.get("sender")

        if not url:
            return {"error": "No URL provided"}

        # 1. Immediate Save to MongoDB (Initial Entry)
        new_doc = {
            "user": sender,
            "url": url,
            "created_at": datetime.datetime.now(),
            "status": "processing"
        }
        result = db.bookmarks.insert_one(new_doc)
        
        # 2. Hand off the scraping/AI to a background thread
        # This keeps the bot responsive!
        background_tasks.add_task(process_link_pipeline, url, result.inserted_id)
        
        return {"status": "received", "id": str(result.inserted_id)}
        
    except Exception as e:
        print(f"Webhook Error: {e}")
        return {"error": str(e)}

# 3. Entry point to run the server
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)