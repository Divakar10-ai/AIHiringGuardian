import os
import re

def update_file(filepath, pattern_replacements, ensure_imports):
    with open(filepath, "r") as f:
        content = f.read()

    for imp in ensure_imports:
        if imp not in content:
            content = imp + "\n" + content

    for pat, repl in pattern_replacements:
        content = re.sub(pat, repl, content, flags=re.MULTILINE)
        
    with open(filepath, "w") as f:
        f.write(content)

# 1. ai_tools.py (ADMIN)
update_file(
    "backend/app/api/ai_tools.py",
    [
        (r'def get_ai_tools\(skip: int = 0, limit: int = 100, db: Session = Depends\(get_db\)\):', 
         r'def get_ai_tools(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):'),
        (r'def get_ai_tool\(tool_id: int, db: Session = Depends\(get_db\)\):',
         r'def get_ai_tool(tool_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):')
    ],
    ["from app.models.all import User", "from app.core.deps import get_current_admin_user"]
)

# 2. audit.py (ADMIN)
update_file(
    "backend/app/api/audit.py",
    [
        (r'get_current_auditor_user', r'get_current_admin_user')
    ],
    ["from app.core.deps import get_current_admin_user"]
)

# 3. candidates.py (USER for normal ops, ADMIN for decision replay)
update_file(
    "backend/app/api/candidates.py",
    [
        (r'def get_candidates\(skip: int = 0, limit: int = 100, db: Session = Depends\(get_db\)\):',
         r'def get_candidates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):'),
        (r'db: Session = Depends\(get_db\)\n\):',
         r'db: Session = Depends(get_db), current_user: User = Depends(get_current_user)\n):'),
        (r'def get_candidate\(candidate_id: str, db: Session = Depends\(get_db\)\):',
         r'def get_candidate(candidate_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):'),
        (r'def get_consent\(candidate_id: str, db: Session = Depends\(get_db\)\):',
         r'def get_consent(candidate_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):'),
        (r'def get_decision_replay\(candidate_id: str, db: Session = Depends\(get_db\)\):',
         r'def get_decision_replay(candidate_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):')
    ],
    ["from app.models.all import User", "from app.core.deps import get_current_user, get_current_admin_user"]
)

# 4. evaluations.py (USER)
update_file(
    "backend/app/api/evaluations.py",
    [
        (r'def get_evaluations\(skip: int = 0, limit: int = 100, db: Session = Depends\(get_db\)\):',
         r'def get_evaluations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):'),
        (r'def get_evaluation\(evaluation_id: int, db: Session = Depends\(get_db\)\):',
         r'def get_evaluation(evaluation_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):'),
        (r'db: Session = Depends\(get_db\)\n\):',
         r'db: Session = Depends(get_db), current_user: User = Depends(get_current_user)\n):')
    ],
    ["from app.models.all import User", "from app.core.deps import get_current_user"]
)

# 5. compliance.py (ADMIN)
update_file(
    "backend/app/api/compliance.py",
    [
        (r'get_current_reviewer_user', r'get_current_admin_user')
    ],
    ["from app.core.deps import get_current_admin_user"]
)
print("Updated API protections")
