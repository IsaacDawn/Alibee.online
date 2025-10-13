import requests
import hashlib
import time
import json
from config.settings import Config

class AliExpressService:
    """Service for AliExpress API integration"""
    
    def __init__(self):
        self.config = Config()
        self.app_key = self.config.APP_KEY
        self.app_secret = self.config.APP_SECRET
        self.tracking_id = self.config.TRACKING_ID
        self.base_url = self.config.ALIEXPRESS_API_BASE_URL
    
    def _generate_signature(self, params):
        """Generate TOP MD5 signature for API request (like PHP version)"""
        # Sort parameters and remove empty values
        clean_params = {}
        for k, v in params.items():
            if v is not None and v != '':
                clean_params[k] = v
        
        # Sort by key
        sorted_params = sorted(clean_params.items())
        
        # Build signature string: secret + concat(params) + secret
        base = self.app_secret
        for k, v in sorted_params:
            base += k + str(v)
        base += self.app_secret
        
        # Generate MD5 hash and convert to uppercase
        signature = hashlib.md5(base.encode('utf-8')).hexdigest().upper()
        
        print(f"Signature generation:")
        print(f"Clean params: {clean_params}")
        print(f"Base string: {base}")
        print(f"Generated signature: {signature}")
        
        return signature
    
    def get_product_details(self, product_ids):
        """Get product details from AliExpress API"""
        try:
            # Prepare parameters
            params = {
                'app_key': self.app_key,
                'method': 'aliexpress.affiliate.product.smartmatch',
                'format': 'json',
                'v': '2.0',
                'sign_method': 'md5',
                'timestamp': str(int(time.time() * 1000)),
                'tracking_id': self.tracking_id,
                'keywords': ' '.join(map(str, product_ids[:5])),  # Limit to 5 products per request
                'page_size': 10
            }
            
            # Generate signature
            signature = self._generate_signature(params)
            params['sign'] = signature
            
            # Make API request
            response = requests.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Check for API errors
            if 'error_response' in data:
                print(f"API Error: {data['error_response']}")
                return []
            
            # Extract products from response
            if 'aliexpress_affiliate_product_smartmatch_response' in data:
                result = data['aliexpress_affiliate_product_smartmatch_response']['result']
                if 'products' in result:
                    return result['products']['product']
            
            return []
            
        except Exception as e:
            print(f"Error fetching product details: {e}")
            return []
    
    def get_single_product(self, product_id, target_currency='USD'):
        """Get details for a single product"""
        try:
            # System parameters (like the working version)
            sys_params = {
                'app_key': self.app_key,
                'method': 'aliexpress.affiliate.productdetail.get',
                'format': 'json',
                'v': '2.0',
                'sign_method': 'md5',
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime()),
                'partner_id': 'apidoc'
            }
            
            # Request parameters
            request_params = {
                'product_ids': str(product_id),
                'target_currency': target_currency,
                'target_language': 'EN',
                'trackingId': self.tracking_id,
                'fields': 'product_id,product_title,original_price,sale_price,sale_price_currency,target_original_price,target_sale_price,target_sale_price_currency,product_detail_url,product_main_image_url,product_small_image_urls,discount,commission_rate,hot_product_commission_rate,first_level_category_id,first_level_category_name,second_level_category_id,second_level_category_name,shop_id,shop_name,shop_url,product_video_url,sku_id,lastest_volume,app_sale_price,target_app_sale_price,target_app_sale_price_currency,evaluate_rate,rating_weighted,rating,score,average_rating,rating_percent,positive_feedback_rate,avg_evaluation_rate,avg_rating_percent,product_description,promotion_link'
            }
            
            # Merge parameters
            all_params = {**sys_params, **request_params}
            
            # Generate signature
            signature = self._generate_signature(all_params)
            all_params['sign'] = signature
            
            print(f"Making API request for product ID: {product_id}")
            print(f"API URL: {self.base_url}")
            print(f"Params: {all_params}")
            
            # Make API request
            response = requests.get(self.base_url, params=all_params, timeout=60)
            response.raise_for_status()
            
            data = response.json()
            print(f"API Response: {data}")
            
            # Check for API errors
            if 'error_response' in data:
                print(f"API Error: {data['error_response']}")
                return None
            
            # Extract product from response
            if 'aliexpress_affiliate_productdetail_get_response' in data:
                resp_result = data['aliexpress_affiliate_productdetail_get_response'].get('resp_result', {})
                if 'result' in resp_result:
                    result_data = resp_result['result']
                    products = result_data.get('products', {})
                    if 'product' in products:
                        product_data = products['product']
                        # Return the first product if it's a list, or the product directly
                        if isinstance(product_data, list) and len(product_data) > 0:
                            return product_data[0]
                        elif isinstance(product_data, dict):
                            return product_data
            
            return None
            
        except Exception as e:
            print(f"Error fetching single product: {e}")
            return None

    def get_multiple_products_batch(self, product_ids, batch_size=10, target_currency='USD'):
        """Get details for multiple products using batch processing"""
        try:
            # Convert product_ids to comma-separated string
            product_ids_str = ','.join(map(str, product_ids))
            
            # System parameters
            sys_params = {
                'app_key': self.app_key,
                'method': 'aliexpress.affiliate.productdetail.get',
                'format': 'json',
                'v': '2.0',
                'sign_method': 'md5',
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime()),
                'partner_id': 'apidoc'
            }
            
            # Request parameters with multiple product IDs
            request_params = {
                'product_ids': product_ids_str,
                'target_currency': target_currency,
                'target_language': 'EN',
                'trackingId': self.tracking_id,
                'fields': 'product_id,product_title,original_price,sale_price,sale_price_currency,target_original_price,target_sale_price,target_sale_price_currency,product_detail_url,product_main_image_url,product_small_image_urls,discount,commission_rate,hot_product_commission_rate,first_level_category_id,first_level_category_name,second_level_category_id,second_level_category_name,shop_id,shop_name,shop_url,product_video_url,sku_id,lastest_volume,app_sale_price,target_app_sale_price,target_app_sale_price_currency,evaluate_rate,rating_weighted,rating,score,average_rating,rating_percent,positive_feedback_rate,avg_evaluation_rate,avg_rating_percent,product_description,promotion_link'
            }
            
            # Merge parameters
            all_params = {**sys_params, **request_params}
            
            # Generate signature
            signature = self._generate_signature(all_params)
            all_params['sign'] = signature
            
            print(f"Making batch API request for {len(product_ids)} product IDs: {product_ids_str}")
            print(f"API URL: {self.base_url}")
            
            # Make API request
            response = requests.get(self.base_url, params=all_params, timeout=120)
            response.raise_for_status()
            
            data = response.json()
            print(f"Batch API Response received")
            
            # Check for API errors
            if 'error_response' in data:
                print(f"Batch API Error: {data['error_response']}")
                return []
            
            # Extract products from response
            products = []
            if 'aliexpress_affiliate_productdetail_get_response' in data:
                resp_result = data['aliexpress_affiliate_productdetail_get_response'].get('resp_result', {})
                if 'result' in resp_result:
                    result_data = resp_result['result']
                    products_data = result_data.get('products', {})
                    if 'product' in products_data:
                        product_data = products_data['product']
                        # Handle both single product and multiple products
                        if isinstance(product_data, list):
                            products = product_data
                        elif isinstance(product_data, dict):
                            products = [product_data]
            
            print(f"Successfully retrieved {len(products)} products from batch request")
            return products
            
        except Exception as e:
            print(f"Error in batch request: {e}")
            return []

    def get_multiple_products_parallel(self, product_ids, max_workers=5):
        """Get details for multiple products using parallel processing"""
        import concurrent.futures
        import threading
        
        results = {}
        lock = threading.Lock()
        
        def fetch_single_product(product_id):
            try:
                product_data = self.get_single_product(product_id)
                with lock:
                    results[product_id] = product_data
                return product_data
            except Exception as e:
                print(f"Error fetching product {product_id}: {e}")
                with lock:
                    results[product_id] = None
                return None
        
        print(f"Starting parallel fetch for {len(product_ids)} products with {max_workers} workers")
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all tasks
            future_to_product = {executor.submit(fetch_single_product, pid): pid for pid in product_ids}
            
            # Collect results as they complete
            for future in concurrent.futures.as_completed(future_to_product):
                product_id = future_to_product[future]
                try:
                    result = future.result()
                except Exception as e:
                    print(f"Product {product_id} generated an exception: {e}")
        
        # Return results in the same order as input
        ordered_results = []
        for product_id in product_ids:
            if product_id in results and results[product_id] is not None:
                ordered_results.append(results[product_id])
        
        print(f"Parallel fetch completed. Retrieved {len(ordered_results)} products")
        return ordered_results
