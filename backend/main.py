from fastapi import FastAPI, Form, Response, BackgroundTasks
from database import get_db
from scraper import extract_content
from processor import analyze_content
import datetime

app = FastAPI()
db = get_db()

# This function runs in the background so WhatsApp doesn't wait
# In backend/main.py

# Inside main.py - Update your background function
def process_link_pipeline(url: str, doc_id):
    extracted = extract_content(url)
    
    # Send the REAL caption and hashtags to the AI for final cleaning
    ai_result = analyze_content(extracted['raw_text'], url)
    
    db.bookmarks.update_one(
        {"_id": doc_id},
        {
            "$set": {
                "category": ai_result['category'],
                "summary": ai_result['summary'],
                "explainability": ai_result['reason'],
                "hashtags": extracted['hashtags'] or ai_result.get('hashtags', []),
                "media_url": extracted.get('media_url', ""),
                "status": "processed"
            }
        }
    )
    print(f"✅ Full IG Extraction Complete: {ai_result['category']}")

@app.post("/webhook")
async def whatsapp_webhook(background_tasks: BackgroundTasks, Body: str = Form(...), From: str = Form(...)):
    url = Body.strip()
    
    # Initial Save
    new_doc = {
        "user": From,
        "url": url,
        "created_at": datetime.datetime.now(),
        "status": "processing"
    }
    result = db.bookmarks.insert_one(new_doc)
    
    # Hand off the heavy lifting to the background
    background_tasks.add_task(process_link_pipeline, url, result.inserted_id)
    
    response = f"<Response><Message>Processing your link... I'll tag it as soon as the AI finishes! 🧠</Message></Response>"
    return Response(content=response, media_type="application/xml")

# ... your other code above ...

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)