import os
import json
import google.generativeai as genai
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-flash-latest')

class ClaudeService: # Keeping the name for compatibility with main.py, or I should rename it
    @staticmethod
    def generate_learning_route(goal: str) -> List[Dict]:
        """
        Generates a hierarchical learning route map for a given goal using Gemini.
        """
        prompt = f"""
        Act as an expert educational advisor. Create a comprehensive, hierarchical learning route map for the following goal: "{goal}".
        
        CRITICAL HIERARCHY RULES:
        1. PARENT NODES (Level 1 & 2): These must focus on the "Big Picture". Their descriptions should explain how the broad concepts connect and why they are important. Avoid specific tools or libraries here (e.g., describe "Frontend Fundamentals" rather than jumping into "React Hooks").
        2. LEAF NODES (Deepest levels): these should be the specific, actionable skills or tools.
        3. CONNECTION FLOW: Ensure that if topic A is a prerequisite for topic B, it is clearly represented in the hierarchy.
        
        Return the result ONLY as a JSON array of objects. Each object must have:
        - "title": (string) Short title of the topic.
        - "description": (string) A summary. For parents, focus on conceptual connections. For leaves, focus on specific skills.
        - "parent_title": (string or null) The title of the immediate prerequisite or parent topic.
        - "level": (integer) Hierarchical level (1 for root, 2 for sub-topics, etc.).
        
        Limit your response to 8-12 nodes total to keep the map readable.
        """
        
        try:
            print(f"DEBUG: Calling Gemini with prompt for: {goal}", flush=True)
            response = model.generate_content(prompt)
            content = response.text
            print(f"DEBUG: Gemini raw response: {content}", flush=True)
            
            # Basic cleanup if Gemini adds markdown blocks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
                
            start_idx = content.find("[")
            end_idx = content.rfind("]") + 1
            json_str = content[start_idx:end_idx]
            return json.loads(json_str)
        except Exception as e:
            print(f"Error parsing Gemini response: {e}")
            return []

    @staticmethod
    def get_resources_for_topic(topic: str, goal_context: str) -> List[Dict]:
        """
        Generates source links (YouTube, articles, etc.) for a specific topic using Gemini.
        """
        prompt = f"""
        For the topic "{topic}" in the context of learning "{goal_context}", provide 3-5 high-quality learning resources.
        
        GUIDELINE:
        - If this is a high-level conceptual topic, prioritize big-picture overviews, architectural articles, and "How it works" videos.
        - If this is a leaf node/specific tool, prioritize hands-on tutorials, documentation, and implementation guides.
        
        Return the result ONLY as a JSON array of objects. Each object must have:
        - "type": (string) e.g., "video", "article", "documentation".
        - "title": (string) Title of the resource.
        - "url": (string) Direct link to the resource.
        - "description": (string) Brief summary of why this is useful.
        
        Example:
        [
          {{"type": "video", "title": "Intro to Variables", "url": "https://youtube.com/...", "description": "Great for beginners"}}
        ]
        """
        
        try:
            response = model.generate_content(prompt)
            content = response.text
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            start_idx = content.find("[")
            end_idx = content.rfind("]") + 1
            json_str = content[start_idx:end_idx]
            return json.loads(json_str)
        except Exception as e:
            print(f"DEBUG ERROR: Gemini API error: {str(e)}", flush=True)
            import traceback
            traceback.print_exc()
            return []
