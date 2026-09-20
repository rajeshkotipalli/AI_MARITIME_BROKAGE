import os
from dotenv import load_dotenv
from google import genai

# Load backend/.env
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set in .env")

# Create Gemini client
client = genai.Client(api_key=api_key)

# Use Google's current Interactions API
interaction = client.interactions.create(
    model="gemini-3.6-flash",
    input="Say hello to Waypoint AI in one sentence."
)

print("\n==============================")
print("WAYPOINT AI GEMINI TEST")
print("==============================")
print(interaction.output_text)
print("==============================")