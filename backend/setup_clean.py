import os
from dotenv import load_dotenv

load_dotenv()


def main():
    from app import create_app, db

    app = create_app()
    with app.app_context():
        print('Creating tables (non-destructive)...')
        db.create_all()
        print('Tables created. No demo data seeded.')


if __name__ == '__main__':
    main()


