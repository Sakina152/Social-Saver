from fastapi import FastAPI, Form, Response
from database import get_db
import datetime

app = FastAPI()
db = get_db()

@app.post("/webhook")
async def whatsapp_webhook(Body: str = Form(...), From: str = Form(...)):
    # 1. Logic to extract URL (simple version)
    incoming_msg = Body.strip()
    
    # 2. Save to MongoDB
    new_bookmark = {
        "user": From,
        "url": incoming_msg,
        "created_at": datetime.datetime.now(),
        "status": "raw"
    }
    db.bookmarks.insert_one(new_bookmark)
    
    # 3. Twilio XML Response (TwiML)
    response = f"""
    <Response>
        <Message>🚀 Got it! Saved "{incoming_msg}" to your dashboard.</Message>
    </Response>
    """
    return Response(content=response, media_type="application/xml")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)