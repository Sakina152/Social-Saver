import os
import json
from google import genai
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Instantiate the Gemini client
# Ensure GEMINI_API_KEY is defined in your .env file
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Define the structure for Structured Outputs
class AnalysisResult(BaseModel):
    category: str      # e.g., "Coding", "Fitness", "Design"
    summary: str       # 1-sentence summary
    reason: str        # Explainability
    hashtags: list[str] # Strategic extraction of tags

def analyze_content(text: str, url: str):
    prompt = f"""
    You are an intelligent content-organizing assistant for a product called "Social Saver".

    PRODUCT GOAL:
    People save valuable content on Instagram and social media, but those saves are hard to search later.
    Your job is to convert messy social links into structured, searchable knowledge.

    USER ACTION:
    The user forwarded this link via WhatsApp.

    URL:
    {url}

    EXTRACTED TEXT / CAPTION (may be empty or incomplete due to platform restrictions):
    {text}

    ------------------------------------
    CORE INSTRUCTION
    ------------------------------------
    Determine the PRIMARY INTENT of the content and classify it in a way that helps the user
    find this link again weeks or months later.

    Instagram and similar platforms are VISUAL-FIRST.
    If meaningful text is missing, you MUST intelligently infer intent using:
    - The platform (Instagram)
    - The content type (Reel / Post)
    - Common cultural patterns (edits, fandoms, tutorials, workouts, aesthetics)

    DO NOT default to vague or generic labels.

    ------------------------------------
    TASKS (FOLLOW STRICTLY)
    ------------------------------------

    1. Category:
    Generate ONE clear, specific, human-friendly category that represents the main idea.

    Categories are NOT fixed.
    Choose what best describes the content's purpose or theme.

    Examples (not exhaustive):
    Coding, Web Development, UI/UX, Graphic Design,
    AI, AI Tools, Machine Learning,
    Fitness, Workout, Nutrition,
    Food, Recipes, Cooking,
    Travel, Photography, Fashion,
    K-Drama, Anime, Movies, TV Shows,
    Productivity, Career, Startups, Marketing,
    Education, Study Tips,
    Mental Health, Self-Improvement,
    Tools, Software, Automation

    STRICT RULES:
    - Use 1–2 words only
    - Capitalize first letter
    - Be specific and actionable
    - DO NOT use generic categories such as:
    Inspiration, General, Other, Lifestyle, Content

    If text is missing:
    → Infer the category from visual context and platform patterns.

    2. Summary:
    Write ONE concise, factual sentence describing what this content is about.
    - Focus on what the user will remember or gain
    - Assume the user may search this later
    - No emojis, no hype, no vague language

    3. Reason:
    Explain WHY you chose this category.
    - Reference visible actions, themes, or platform-specific patterns
    - If inferred, explicitly say so

    Example:
    "Classified as K-Drama because Instagram reels commonly feature edited scenes from Korean dramas, and the content matches that visual style."

    4. Hashtags:
    Generate 3–6 relevant hashtags for filtering and search.

    Rules:
    - lowercase
    - no spaces
    - concise
    - derived from the actual or inferred content

    ------------------------------------
    FAILSAFE RULE
    ------------------------------------
    Only if NO meaningful inference can be made at all:
    - Use category: "Motivation"
    - Clearly state in Reason that the content lacked identifiable signals

    ------------------------------------
    OUTPUT RULES
    ------------------------------------
    - Return VALID JSON only
    - No markdown
    - No commentary
    - This output will be stored directly in a database and rendered on a dashboard
    """
    
    try:
        # Use the stable Gemini 2.5 Flash model
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': AnalysisResult,
            }
        )
        
        # Parse and return the validated JSON response
        return json.loads(response.text)
        
    except Exception as e:
        print(f"Gemini Error: {e}")
        return {
            "category": "Uncategorized",
            "summary": "Could not generate summary.",
            "reason": f"AI processing failed: {str(e)}",
            "hashtags": []
        }