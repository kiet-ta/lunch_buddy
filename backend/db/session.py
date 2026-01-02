from core.config import settings
from sqlmodel import Session, create_engine

# echo = True help for debugging and seeing the generated SQL statements
engine = create_engine(settings.DATABASE_URL, echo=settings.DB_ECHO)


def get_db():
    with Session(engine) as session:
        yield session
