from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Update to the correct revision
    conn.execute(text("UPDATE alembic_version SET version_num = '002'"))
    conn.commit()
    print("Updated alembic_version to '002'")
