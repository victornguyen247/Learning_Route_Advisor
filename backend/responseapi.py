import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure
api_key = os.environ.get("GEMINI_API_KEY")
print(f"Using API Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")
genai.configure(api_key=api_key)

def test_gemini():
    # We'll try listing models first to see what's available
    print("\n--- Available Models ---")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
    except Exception as e:
        print(f"Error listing models: {e}")

    # Now test the specific prompt
    print("\n--- Testing 'fullstack developer' ---")
    # Using gemini-flash-latest which matches your available models list
    model_name = 'gemini-flash-latest' 
    print(f"Using model: {model_name}")
    
    model = genai.GenerativeModel(model_name)
    prompt = "Create a hierarchical learning route map for: 'fullstack developer'. Return ONLY a JSON array of objects with title, description, parent_title, level."
    
    try:
        response = model.generate_content(prompt)
        print("\nGemini Response:")
        print(response.text)
    except Exception as e:
        print(f"\nError during generation: {e}")

if __name__ == "__main__":
    test_gemini()
