from database.repository import ProductRepository
from services.aliexpress_service import AliExpressService
from config.settings import Config

class ProductService:
    """Business logic for product operations"""
    
    def __init__(self):
        self.repository = ProductRepository()
        self.aliexpress_service = AliExpressService()
        self.config = Config()
    
    def get_products_with_details(self, page=1, per_page=None):
        """Get products with full details from AliExpress API"""
        if per_page is None:
            per_page = self.config.PRODUCTS_PER_PAGE
        
        try:
            # Get product IDs from database
            db_products = self.repository.get_products_paginated(page, per_page)
            
            if not db_products:
                return {
                    'products': [],
                    'page': page,
                    'per_page': per_page,
                    'total': 0,
                    'has_more': False
                }
            
            # Extract product IDs
            product_ids = [product['product_id'] for product in db_products]
            
            # Get detailed product information from AliExpress API
            detailed_products = []
            
            # Process products in batches to avoid API limits
            batch_size = 5
            for i in range(0, len(product_ids), batch_size):
                batch_ids = product_ids[i:i + batch_size]
                batch_products = self.aliexpress_service.get_product_details(batch_ids)
                detailed_products.extend(batch_products)
            
            # Get total count for pagination
            total_count = self.repository.get_total_products_count()
            has_more = (page * per_page) < total_count
            
            return {
                'products': detailed_products,
                'page': page,
                'per_page': per_page,
                'total': total_count,
                'has_more': has_more
            }
            
        except Exception as e:
            print(f"Error in get_products_with_details: {e}")
            return {
                'products': [],
                'page': page,
                'per_page': per_page,
                'total': 0,
                'has_more': False,
                'error': str(e)
            }
    
    def get_all_product_ids(self):
        """Get all product IDs from database"""
        return self.repository.get_all_product_ids()
    
    def get_total_products_count(self):
        """Get total number of products"""
        return self.repository.get_total_products_count()
    
    def get_single_product_details(self, product_id):
        """Get complete product details for a single product ID from AliExpress API"""
        try:
            # Get product details from AliExpress API
            product_details = self.aliexpress_service.get_single_product(product_id)
            
            if product_details:
                return product_details
            else:
                print(f"AliExpress API failed for product {product_id}")
                return None
                
        except Exception as e:
            print(f"Error in get_single_product_details: {e}")
            return None

    def get_multiple_products_batch(self, product_ids, batch_size=10, target_currency='USD'):
        """Get multiple products using batch processing"""
        try:
            products = self.aliexpress_service.get_multiple_products_batch(product_ids, batch_size, target_currency)
            return products
        except Exception as e:
            print(f"Error in batch product service: {e}")
            return []

    def get_multiple_products_parallel(self, product_ids, max_workers=5):
        """Get multiple products using parallel processing"""
        try:
            products = self.aliexpress_service.get_multiple_products_parallel(product_ids, max_workers)
            return products
        except Exception as e:
            print(f"Error in parallel product service: {e}")
            return []
    
    def get_single_product_details_with_currency(self, product_id, target_currency='USD'):
        """Get single product details with specific currency"""
        try:
            product_details = self.aliexpress_service.get_single_product(product_id, target_currency)
            return product_details
        except Exception as e:
            print(f"Error in get_single_product_details_with_currency: {e}")
            return None
