from core.config import settings
import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlmodel import SQLModel

# Ensure Python can locate the project root directory
# (Adjust this path if your project structure differs)
current_path = os.path.dirname(
    os.path.abspath(__file__)
)  # Directory containing env.py (alembic/)
backend_path = os.path.dirname(current_path)  # backend/ directory
sys.path.append(backend_path)


# Import ALL models so Alembic can detect them for autogeneration
from models import user, group, group_member, expenses, expense_share

# This is the Alembic Config object, which provides
# access to values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This sets up loggers based on the configuration file.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Add your model's MetaData object here
# for 'autogenerate' support
# IMPORTANT: Use SQLModel.metadata instead of None
target_metadata = SQLModel.metadata

# Other values from the config, defined by the needs of env.py,
# can be accessed here if required.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with a database URL
    instead of an Engine. No DBAPI is required.

    Calls to context.execute() emit SQL statements
    directly to the output.
    """
    # Retrieve the database URL from application settings
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this mode, an Engine is created and a live
    database connection is used for migrations.
    """
    # Inject the database URL from settings into Alembic configuration
    configuration = config.get_section(config.config_ini_section)
    if configuration is None:
        configuration = {}
    configuration["sqlalchemy.url"] = settings.DATABASE_URL

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

