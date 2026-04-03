import urllib.request
import urllib.error
import json

GROQ_KEY = "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"
URL = "https://api.groq.com/openai/v1/chat/completions"

payload = json.dumps({
    "model": "llama-3.3-70b-versatile",
    "messages": [
        {"role": "system", "content": "You are a pharmacy assistant."},
        {"role": "user", "content": "Say hello in one sentence."}
    ],
    "max_tokens": 50,
    "temperature": 0.7
}).encode("utf-8")

req = urllib.request.Request(URL, data=payload, method="POST", headers={
    "Content-Type": "application/json",
    "Authorization": f"Bearer {GROQ_KEY}",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
})

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read())
        text = data["choices"][0]["message"]["content"]
        print(f"SUCCESS: {text.strip()}")
        print("\nGroq works! Restart your Spring Boot backend and test via the chat widget.")
except urllib.error.HTTPError as e:
    raw = e.read().decode("utf-8", errors="replace")
    print(f"FAILED HTTP {e.code}: {raw[:300]}")
    if "1010" in raw or e.code == 403:
        print()
        print("Cloudflare is blocking direct connections from your network.")
        print("This only affects the Python test — Spring Boot uses Java HttpClient which behaves differently.")
        print("Skip this test and try the chat widget directly in your browser after restarting the backend.")
except Exception as e:
    print(f"ERROR: {e}")
