import pymysql
from config.settings import Config

class DatabaseConnection:
    """Database connection manager"""
    
    def __init__(self):
        self.config = Config()
        self.connection = None
    
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = pymysql.connect(
                host=self.config.DB_HOST,
                user=self.config.DB_USER,
                password=self.config.DB_PASSWORD,
                database=self.config.DB_NAME,
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor
            )
            return self.connection
        except Exception as e:
            print(f"Database connection error: {e}")
            return None
    
    def disconnect(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            self.connection = None
    
    def get_connection(self):
        """Get current connection or create new one"""
        if not self.connection or not self.connection.open:
            return self.connect()
        return self.connection

# Global database instance
db = DatabaseConnection()
