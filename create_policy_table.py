import sys
from app.database.core import engine
from app.models.all import Base
print('Creating tables...')
Base.metadata.create_all(bind=engine)
print('Done.')
