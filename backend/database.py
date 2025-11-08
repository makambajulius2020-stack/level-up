import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.connection = None
        self.enabled = os.getenv('USE_MYSQL', '0') == '1' and not os.getenv('DATABASE_URL', '').lower().startswith('sqlite')
        if self.enabled:
            self.connect()
        else:
            print("ℹ️ External MySQL content DB disabled (using SQLite app DB)")
    
    def connect(self):
        try:
            self.connection = pymysql.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                user=os.getenv('DB_USER', 'root'),
                password=os.getenv('DB_PASSWORD', ''),
                database=os.getenv('DB_NAME', 'smart_school_db'),
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor
            )
            print("✅ Database connected successfully!")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            self.connection = None
    
    def execute_query(self, query, params=None):
        if not self.connection:
            return None
        
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params)
                return cursor.fetchall()
        except Exception as e:
            print(f"Query error: {e}")
            return None
    
    def execute_insert(self, query, params=None):
        if not self.connection:
            return None
        
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params)
                self.connection.commit()
                return cursor.lastrowid
        except Exception as e:
            print(f"Insert error: {e}")
            self.connection.rollback()
            return None
    
    def close(self):
        if self.connection:
            self.connection.close()

# Global database instance
db = Database()
