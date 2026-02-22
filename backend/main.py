from fastapi import FastAPI, Request, BackgroundTasks, Body
from database import get_db
from scraper import extract_content
from processor import analyze_content
import datetime
import uvicorn

app = FastAPI()
db = get_db()

def process_link_pipeline(url: str, doc_id):
    """
    Background task that handles scraping and AI analysis.
    """
    try:
        print(f"🔄 Processing: {url}")
        extracted = extract_content(url)
        ai_result = analyze_content(extracted['raw_text'], url)
        
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
        print(f"✅ Successfully processed and saved!")
        
    except Exception as e:
        print(f"❌ Error in pipeline: {e}")
        db.bookmarks.update_one({"_id": doc_id}, {"$set": {"status": "error"}})

# --- NEW ENDPOINT: Identity Bridge ---
@app.post("/link-user")
async def link_user(payload: dict = Body(...)):
    """
    Maps a WhatsApp sender ID to a Clerk User Email.
    """
    phone = payload.get("phone")
    email = payload.get("email")
    
    if not phone or not email:
        return {"error": "Missing phone or email"}

    # Save mapping in a new collection called 'user_mappings'
    db.user_mappings.update_one(
        {"phone": phone},
        {"$set": {"email": email, "linked_at": datetime.datetime.now()}},
        upsert=True
    )
    print(f"🔗 Linked WhatsApp {phone} to {email}")
    return {"status": "success"}

# --- UPDATED ENDPOINT: Webhook with User Lookup ---
@app.post("/webhook")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    try:
        data = await request.json()
        url = data.get("url")
        sender = data.get("sender") # The WhatsApp ID (e.g. 123456@c.us)

        if not url:
            return {"error": "No URL provided"}

        # 1. LOOKUP: Who does this WhatsApp ID belong to?
        mapping = db.user_mappings.find_one({"phone": sender})
        
        if not mapping:
            # If not linked, we save it with the phone ID, 
            # but it won't show up on the web dashboard yet.
            target_user = sender 
            print(f"⚠️ Warning: Unlinked user {sender} sent a link.")
        else:
            target_user = mapping["email"]

        # 2. Immediate Save (Initial Entry)
        new_doc = {
            "userId": target_user, # Now using the Email if linked!
            "url": url,
            "created_at": datetime.datetime.now(),
            "status": "processing"
        }
        result = db.bookmarks.insert_one(new_doc)
        
        # 3. Background Processing
        background_tasks.add_task(process_link_pipeline, url, result.inserted_id)
        
        return {"status": "received", "owner": target_user}
        
    except Exception as e:
        print(f"Webhook Error: {e}")
        return {"error": str(e)}

@app.get("/health")
def health_check():
    return {"status": "alive"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)