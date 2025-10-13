from database.connection import db
from config.settings import Config

class ProductRepository:
    """Data access layer for products"""
    
    def __init__(self):
        self.config = Config()
        self.table_name = self.config.DB_TABLENAME
    
    def get_all_product_ids(self):
        """Get all product IDs from saved_products table"""
        try:
            connection = db.get_connection()
            with connection.cursor() as cursor:
                sql = f"SELECT product_id FROM {self.table_name}"
                cursor.execute(sql)
                results = cursor.fetchall()
                return [row['product_id'] for row in results]
        except Exception as e:
            print(f"Error fetching product IDs: {e}")
            return []
    
    def get_products_paginated(self, page=1, per_page=10):
        """Get products with pagination"""
        try:
            connection = db.get_connection()
            with connection.cursor() as cursor:
                offset = (page - 1) * per_page
                sql = f"""
                    SELECT product_id, product_title, product_category, saved_at 
                    FROM {self.table_name} 
                    ORDER BY saved_at DESC 
                    LIMIT %s OFFSET %s
                """
                cursor.execute(sql, (per_page, offset))
                return cursor.fetchall()
        except Exception as e:
            print(f"Error fetching paginated products: {e}")
            return []
    
    def get_total_products_count(self):
        """Get total count of products"""
        try:
            connection = db.get_connection()
            with connection.cursor() as cursor:
                sql = f"SELECT COUNT(*) as total FROM {self.table_name}"
                cursor.execute(sql)
                result = cursor.fetchone()
                return result['total'] if result else 0
        except Exception as e:
            print(f"Error getting products count: {e}")
            return 0
    
    def get_unique_categories(self):
        """Get all unique categories from product_category column"""
        try:
            connection = db.get_connection()
            with connection.cursor() as cursor:
                sql = f"""
                    SELECT DISTINCT product_category, COUNT(*) as product_count 
                    FROM {self.table_name} 
                    WHERE product_category IS NOT NULL AND product_category != ''
                    GROUP BY product_category 
                    ORDER BY product_count DESC, product_category ASC
                """
                cursor.execute(sql)
                results = cursor.fetchall()
                
                # Convert to list of dictionaries
                categories = []
                for row in results:
                    categories.append({
                        'category_name': row['product_category'],
                        'product_count': row['product_count']
                    })
                
                return categories
        except Exception as e:
            print(f"Error fetching unique categories: {e}")
            return []
    
    def get_products_with_video(self):
        """Get all product IDs that have video (has_video = 1)"""
        try:
            connection = db.get_connection()
            with connection.cursor() as cursor:
                sql = f"""
                    SELECT product_id, product_title, product_category, saved_at 
                    FROM {self.table_name} 
                    WHERE has_video = 1
                    ORDER BY saved_at DESC
                """
                cursor.execute(sql)
                results = cursor.fetchall()
                
                # Convert to list of dictionaries
                products = []
                for row in results:
                    products.append({
                        'product_id': row['product_id'],
                        'product_title': row['product_title'],
                        'product_category': row['product_category'],
                        'saved_at': row['saved_at']
                    })
                
                return products
        except Exception as e:
            print(f"Error fetching products with video: {e}")
            return []
    
    def get_product_ids_with_video(self):
        """Get only product IDs that have video (has_video = 1)"""
        try:
            connection = db.get_connection()
            with connection.cursor() as cursor:
                sql = f"SELECT product_id FROM {self.table_name} WHERE has_video = 1"
                cursor.execute(sql)
                results = cursor.fetchall()
                return [row['product_id'] for row in results]
        except Exception as e:
            print(f"Error fetching product IDs with video: {e}")
            return []
    
    def get_custom_titles(self, product_ids):
        """Get custom titles for given product IDs"""
        try:
            if not product_ids:
                return {}
            
            connection = db.get_connection()
            with connection.cursor() as cursor:
                # Create placeholders for the IN clause
                placeholders = ','.join(['%s'] * len(product_ids))
                sql = f"""
                    SELECT product_id, custom_title 
                    FROM {self.table_name} 
                    WHERE product_id IN ({placeholders}) 
                    AND custom_title IS NOT NULL 
                    AND custom_title != ''
                """
                cursor.execute(sql, product_ids)
                results = cursor.fetchall()
                
                # Convert to dictionary for easy lookup
                custom_titles = {}
                for row in results:
                    custom_titles[row['product_id']] = row['custom_title']
                
                return custom_titles
        except Exception as e:
            print(f"Error fetching custom titles: {e}")
            return {}
    
    def get_product_ids_with_custom_titles(self):
        """Get all product IDs that have custom_title"""
        try:
            connection = db.get_connection()
            with connection.cursor() as cursor:
                sql = f"""
                    SELECT product_id 
                    FROM {self.table_name} 
                    WHERE custom_title IS NOT NULL 
                    AND custom_title != ''
                    ORDER BY product_id ASC
                """
                cursor.execute(sql)
                results = cursor.fetchall()
                return [row['product_id'] for row in results]
        except Exception as e:
            print(f"Error fetching product IDs with custom titles: {e}")
            return []
