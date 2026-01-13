import os
import yaml
import argparse
import sys
from openai import OpenAI

# -------------------------------------------------------------------------
# SETUP
# -------------------------------------------------------------------------
# You can set the API key in env var OPENAI_API_KEY
# or hardcode it here (not recommended for git repos).
client = OpenAI(
    # api_key=os.environ.get("OPENAI_API_KEY"),
)

DATA_DIR = 'data'

# -------------------------------------------------------------------------
# PROMPTS
# -------------------------------------------------------------------------

SYSTEM_PROMPT = """
You are an expert tutor creating high-quality, advanced flashcard questions for a study app.
Your goal is to generate tough, precise, and educational multiple-choice questions.

STRICT FORMATTING RULES:
1. Return ONLY raw YAML. No markdown blocks (```yaml), no introductory text.
2. The YAML must be a list of objects.
3. Tags should be 1-3 short strings.
4. "feedback" for each option must be concise (1 sentence).
5. "explanation" should be the "Why" feature: concise synthesis of why the correct is correct and others wrong.

YAML SCHEMA:
- id: "unique-string-id" # You must generate this
  type: "multiple_choice"
  tags: ["Tag1", "Tag2"]
  question: "The question text?"
  image: null
  options:
    - text: "Option A text"
      correct: false
      feedback: "Concise reason why A is wrong."
    - text: "Option B text" (The correct one)
      correct: true
      feedback: "Concise reason why B is correct."
    - text: "Option C text"
      correct: false
      feedback: "Concise reason why C is wrong."
    - text: "Option D text"
      correct: false
      feedback: "Concise reason why D is wrong."
  explanation: "General explanation text."

CRITICAL: 
- Do NOT output duplicates of provided existing questions.
- Focus on concepts not yet covered if possible.
"""

# -------------------------------------------------------------------------
# FUNCTIONS
# -------------------------------------------------------------------------

def get_subjects():
    """Returns a list of folders in data/"""
    return [d for d in os.listdir(DATA_DIR) if os.path.isdir(os.path.join(DATA_DIR, d))]

def get_topics(subject):
    """Returns list of .yaml filenames in data/subject/"""
    path = os.path.join(DATA_DIR, subject)
    return [f for f in os.listdir(path) if f.endswith('.yaml')]

def load_existing(filepath):
    """Loads existing YAML to get IDs and Questions to avoid dupes"""
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        try:
            return yaml.safe_load(f) or []
        except:
            return []

def main():
    print("--- Iller5 Content Factory ---")
    
    # 1. Select Subject
    subjects = get_subjects()
    if not subjects:
        print("No subjects found in data/. Create a folder first.")
        sys.exit(1)
        
    print("\nSubjects:")
    for i, s in enumerate(subjects):
        print(f"{i+1}. {s}")
        
    s_idx = int(input("\nSelect Subject (Number): ")) - 1
    subject = subjects[s_idx]
    
    # 2. Select Topic (or create new)
    topics = get_topics(subject)
    print(f"\nTopics in {subject}:")
    for i, t in enumerate(topics):
        print(f"{i+1}. {t}")
    print(f"{len(topics)+1}. [New Topic]")
    
    t_idx = int(input("\nSelect Topic (Number): ")) - 1
    
    if t_idx == len(topics):
        new_name = input("Enter new topic name (e.g. 'pharmacology'): ").strip()
        if not new_name.endswith('.yaml'):
            new_name += '.yaml'
        filename = new_name
    else:
        filename = topics[t_idx]
        
    filepath = os.path.join(DATA_DIR, subject, filename)
    
    # 3. Load Context
    existing = load_existing(filepath)
    print(f"Loaded {len(existing)} existing questions.")
    
    # Extract context for LLM
    # We send ID and Question text to avoid dupes
    existing_summary = [{"id": q['id'], "q": q['question']} for q in existing]
    
    # 4. Image Check
    use_images = input("Generate Image-based questions? (y/N): ").lower().strip() == 'y'
    
    # 5. Call LLM
    print("\nContacting OpenAI (GPT-5.2 placeholder)...")
    
    user_prompt = f"""
    Subject: {subject}
    Topic: {filename.replace('.yaml', '')}
    Use Images: {use_images}
    Existing Questions (Do NOT duplicate): {json.dumps(existing_summary)}
    
    Generate 5 new high-quality questions.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
        )
        
        content = response.choices[0].message.content
        
        # Strip markdown codes if present
        clean_content = content.replace("```yaml", "").replace("```", "").strip()
        
        new_questions = yaml.safe_load(clean_content)
        
        if not new_questions:
            print("Error: No questions generated/parsed.")
            return

        print(f"\nGenerated {len(new_questions)} questions.")
        
        # Append to file
        all_data = existing + new_questions
        
        with open(filepath, 'w', encoding='utf-8') as f:
            yaml.dump(all_data, f, sort_keys=False, allow_unicode=True)
            
        print(f"Saved to {filepath}")
        
    except Exception as e:
        print(f"Error during generation: {e}")

if __name__ == '__main__':
    main()
