# Delta-Security — Cybersecurity AI Assistant

A terminal-based AI assistant specialized exclusively in cybersecurity and information security. Built with Python, designed to run on Linux and Termux.

---

## Features

- Conversational Q&A on all major cybersecurity topics.
- Structured command reference for Linux/security tools (Nmap, Wireshark, Hashcat, SSH, etc.).
- Fuzzy search through the knowledge base using RapidFuzz — handles typos and rephrasing.
- Out-of-scope detection — politely refuses questions unrelated to security.
- Full conversation logging to a local SQLite database.
- Unanswered question tracking for future knowledge base improvement.
- Bilingual support: English and Arabic.
- Rich terminal UI with color-coded output.

## Topics Covered

Cybersecurity · Information Security · Linux · Bash · Shell · Kali Linux · Networking · Python for Security · Nmap · Wireshark · Metasploit · OWASP · Digital Forensics · Malware Analysis · Cryptography · SOC · Incident Response · Threat Hunting · Secure Coding · IAM · Firewalls · IDS/IPS · Active Directory · Windows Security · CTF · Reverse Engineering

---

## Installation

### Linux (Ubuntu / Debian / Kali)

```bash
# Clone the project
git clone https://github.com/yourname/cj-ai.git
cd cj-ai

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run
python main.py
```

### Termux (Android)

```bash
# Install Python if not already installed
pkg update && pkg install python

# Clone the project
pkg install git
git clone https://github.com/yourname/cj-ai.git
cd cj-ai

# Install dependencies
pip install -r requirements.txt

# Run
python main.py
```

---

## Running

```bash
python main.py
```

You will see:

```
╔══════════════════════════════════════════════════╗
║                                                  ║
║   Delta-Security                                 ║
║   Cybersecurity AI Assistant                     ║
║   Version 1.0                                    ║
║                                                  ║
╚══════════════════════════════════════════════════╝

Type your cybersecurity question. Type 'exit' or 'quit' to leave.

You > 
```

Type a question and press Enter. Type `exit`, `quit`, or `خروج` to exit.

---

## Project Structure

```
cj-ai/
├── main.py                  # Entry point
├── config.py                # Constants, paths, topic keywords
├── requirements.txt
├── README.md
│
├── knowledge/
│   ├── knowledge.json       # Main Q&A knowledge base
│   └── training_data.json   # Pending entries awaiting review
│
├── database/
│   ├── database.py          # SQLite interface
│   └── chat_history.db      # Auto-created on first run
│
├── core/
│   ├── chat.py              # Main orchestrator (respond to user input)
│   ├── memory.py            # In-session conversation memory
│   ├── learning.py          # Records unanswered questions
│   ├── search.py            # RapidFuzz knowledge base search
│   ├── shell_helper.py      # Structured command reference
│   ├── security_filter.py   # Topic scope enforcement
│   └── knowledge_loader.py  # Load / append knowledge.json
│
├── ui/
│   └── console.py           # Rich terminal UI
│
├── utils/
│   ├── logger.py            # Python logging setup
│   ├── helpers.py           # General utility functions
│   └── text.py              # Text normalization, command detection
│
└── tests/
    ├── test_chat.py         # Chat engine and security filter tests
    └── test_memory.py       # Memory and helper tests
```

---

## Database Schema

The SQLite database (`database/chat_history.db`) contains four tables:

| Table | Description |
|-------|-------------|
| `users` | User records (username, created_at) |
| `messages` | All conversation messages (role, content, timestamp) |
| `unanswered` | Questions Delta-Security couldn't answer — for developer review |
| `logs` | System log entries |

---

## Adding Knowledge

### Method 1 — Edit knowledge.json directly

Open `knowledge/knowledge.json` and add a new entry to the `entries` array:

```json
{
  "id": 999,
  "question": "What is a replay attack?",
  "answer": "A replay attack is when an attacker intercepts and retransmits valid data...",
  "tags": ["replay attack", "network security", "authentication"]
}
```

Make sure the `id` is unique. Restart Delta-Security for the change to take effect.

### Method 2 — Use the knowledge_loader API (programmatic)

```python
from core.knowledge_loader import append_entry
from config import KNOWLEDGE_FILE

append_entry(
    path=KNOWLEDGE_FILE,
    question="What is a replay attack?",
    answer="A replay attack occurs when...",
    tags=["replay attack", "network security"]
)
```

### Reviewing Unanswered Questions

Questions that Delta-Security couldn't answer are stored in the `unanswered` table. To review them:

```python
from database.database import Database
from config import DB_FILE

db = Database(DB_FILE)
db.initialize()
for row in db.get_unreviewed():
    print(row["id"], row["question"])
```

Once you've added an answer to the knowledge base, mark the entry as reviewed:

```python
db.mark_reviewed(question_id=5)
```

---

## Running Tests

```bash
# Install pytest if needed
pip install pytest

# Run all tests
python -m pytest tests/ -v
```

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `rapidfuzz` | Fuzzy string matching for knowledge base search |
| `rich` | Terminal styling and colored output |

Both are standard Python packages, compatible with Linux and Termux.

---

## Design Principles

- No offensive capabilities — Delta-Security is purely educational and defensive.
- No automatic learning from user input — all knowledge additions require developer review.
- No external API calls — fully offline operation.
- Modular architecture — each component has a single responsibility.
- Easy to extend — add topics by editing one JSON file.

---

## License

MIT License — see `LICENSE` file.
