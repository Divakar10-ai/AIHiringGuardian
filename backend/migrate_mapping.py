import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.database.core import engine
from app.models.all import Base

def migrate():
    print("Creating mapping tables safely...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

if __name__ == "__main__":
    migrate()
