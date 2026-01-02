import sys
from sqlalchemy import text
from db.session import engine

def fix_alembic_version():
    if not sys.stdin.isatty():
        print("Not running in interactive mode. Skipping confirmation, proceed with caution.")
    else:
        confirm = input("Are you sure you want to drop 'alembic_version' table? (y/n): ")
        if confirm.lower() != 'y':
            print("Aborted.")
            return

    try:
        with engine.connect() as connection:
            connection.execute(text("DROP TABLE IF EXISTS alembic_version"))
            connection.commit()
            print("Successfully dropped alembic_version table.")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    fix_alembic_version()