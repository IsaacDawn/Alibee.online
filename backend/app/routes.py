from flask import Blueprint, jsonify, request
from services.product_service import ProductService
import time

main = Blueprint('main', __name__)
product_service = ProductService()

@main.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'message': 'Alibee Shop API is running',
        'status': 'success'
    })

@main.route('/api/products', methods=['GET'])
def get_products():
    """Get products with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Validate parameters
        if page < 1:
            page = 1
        if per_page < 1 or per_page > 50:
            per_page = 10
        
        result = product_service.get_products_with_details(page, per_page)
        
        return jsonify({
            'status': 'success',
            'data': result
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@main.route('/api/products/count', methods=['GET'])
def get_products_count():
    """Get total number of products"""
    try:
        count = product_service.get_total_products_count()
        return jsonify({
            'status': 'success',
            'data': {
                'total': count
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@main.route('/api/products/ids', methods=['GET'])
def get_product_ids():
    """Get all product IDs"""
    try:
        product_ids = product_service.get_all_product_ids()
        return jsonify({
            'status': 'success',
            'data': {
                'product_ids': product_ids,
                'count': len(product_ids)
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@main.route('/api/products/single', methods=['GET'])
def get_single_product():
    """Get complete product information by ID from AliExpress API"""
    try:
        # Get product_id and currency from query parameters
        product_id = request.args.get('product_id')
        currency = request.args.get('currency', 'USD').upper()  # Default to USD
        
        # Validate product_id
        if not product_id or not product_id.strip():
            return jsonify({
                'status': 'error',
                'message': 'Product ID is required'
            }), 400
        
        # Validate currency
        if currency not in ['USD', 'EUR', 'ILS', 'CNY', 'JPY', 'GBP']:
            return jsonify({
                'status': 'error',
                'message': 'currency must be one of: USD, EUR, ILS, CNY, JPY, GBP'
            }), 400
        
        print(f"Requested product ID: {product_id} in currency: {currency}")
        
        # Get product details from AliExpress API with specified currency
        product_details = product_service.get_single_product_details_with_currency(product_id, currency)
        
        print(f"Product details result: {product_details}")
        
        if product_details:
            # Check for custom title and apply it
            from database.repository import ProductRepository
            repository = ProductRepository()
            custom_titles = repository.get_custom_titles([int(product_id)])
            
            if int(product_id) in custom_titles:
                product_details['product_title'] = custom_titles[int(product_id)]
                product_details['custom_title'] = custom_titles[int(product_id)]
                print(f"Applied custom title for product {product_id}: {custom_titles[int(product_id)]}")
            else:
                product_details['custom_title'] = None
            
            return jsonify({
                'status': 'success',
                'data': {
                    'product': product_details,
                    'requested_currency': currency
                }
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Product not found or failed to fetch from AliExpress API. Please check API credentials and method.'
            }), 404
            
    except Exception as e:
        print(f"Exception in get_single_product: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@main.route('/api/products/sorted-by-price', methods=['GET'])
def get_products_sorted_by_price():
    """Get all products sorted by price (low to high) with USD conversion"""
    try:
        # Get all product IDs from database
        product_ids = product_service.get_all_product_ids()
        
        if not product_ids:
            return jsonify({
                'status': 'success',
                'data': {
                    'products': [],
                    'total': 0,
                    'message': 'No products found in database'
                }
            })
        
        print(f"Found {len(product_ids)} products in database - using batch processing for speed")
        
        # Use batch processing to get all products at once with EUR currency
        batch_size = 10
        all_products = product_service.get_multiple_products_batch(product_ids, batch_size, 'EUR')
        
        # Filter out None values and process products with USD prices
        products_with_prices = []
        
        for product in all_products:
            if product:
                # Extract price information
                sale_price = product.get('sale_price', '0')
                sale_price_currency = product.get('sale_price_currency', 'USD')
                target_sale_price = product.get('target_sale_price', sale_price)
                target_sale_price_currency = product.get('target_sale_price_currency', 'USD')
                
                # Convert to float for sorting
                try:
                    if target_sale_price_currency == 'USD' and target_sale_price:
                        price_usd = float(target_sale_price)
                    elif sale_price_currency == 'USD' and sale_price:
                        price_usd = float(sale_price)
                    else:
                        # If no USD price available, skip this product
                        print(f"Skipping product - no USD price: {product.get('product_title', 'Unknown')} (target: {target_sale_price} {target_sale_price_currency}, sale: {sale_price} {sale_price_currency})")
                        continue
                except (ValueError, TypeError) as e:
                    print(f"Error converting price to float: {e}")
                    continue
                
                # Add USD price for sorting
                product['price_usd'] = price_usd
                products_with_prices.append(product)
        
        # Sort products by price (low to high)
        products_with_prices.sort(key=lambda x: x['price_usd'])
        
        # Remove the temporary price_usd field from response
        for product in products_with_prices:
            del product['price_usd']
        
        print(f"Successfully processed {len(products_with_prices)} products using batch processing")
        
        return jsonify({
            'status': 'success',
            'data': {
                'products': products_with_prices,
                'total': len(products_with_prices),
                'sorted_by': 'price_usd_asc',
                'message': f'Found {len(products_with_prices)} products sorted by price (low to high) using batch processing'
            }
        })
        
    except Exception as e:
        print(f"Exception in get_products_sorted_by_price: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@main.route('/api/products/sorted-by-price-desc', methods=['GET'])
def get_products_sorted_by_price_desc():
    """Get all products sorted by price (high to low) with USD conversion"""
    try:
        # Get all product IDs from database
        product_ids = product_service.get_all_product_ids()
        
        if not product_ids:
            return jsonify({
                'status': 'success',
                'data': {
                    'products': [],
                    'total': 0,
                    'message': 'No products found in database'
                }
            })
        
        print(f"Found {len(product_ids)} products in database - using batch processing for speed")
        
        # Use batch processing to get all products at once with EUR currency
        batch_size = 10
        all_products = product_service.get_multiple_products_batch(product_ids, batch_size, 'EUR')
        
        # Filter out None values and process products with USD prices
        products_with_prices = []
        
        for product in all_products:
            if product:
                # Extract price information
                sale_price = product.get('sale_price', '0')
                sale_price_currency = product.get('sale_price_currency', 'USD')
                target_sale_price = product.get('target_sale_price', sale_price)
                target_sale_price_currency = product.get('target_sale_price_currency', 'USD')
                
                # Convert to float for sorting
                try:
                    if target_sale_price_currency == 'USD' and target_sale_price:
                        price_usd = float(target_sale_price)
                    elif sale_price_currency == 'USD' and sale_price:
                        price_usd = float(sale_price)
                    else:
                        # If no USD price available, skip this product
                        print(f"Skipping product - no USD price: {product.get('product_title', 'Unknown')} (target: {target_sale_price} {target_sale_price_currency}, sale: {sale_price} {sale_price_currency})")
                        continue
                except (ValueError, TypeError) as e:
                    print(f"Error converting price to float: {e}")
                    continue
                
                # Add USD price for sorting
                product['price_usd'] = price_usd
                products_with_prices.append(product)
        
        # Sort products by price (high to low)
        products_with_prices.sort(key=lambda x: x['price_usd'], reverse=True)
        
        # Remove the temporary price_usd field from response
        for product in products_with_prices:
            del product['price_usd']
        
        print(f"Successfully processed {len(products_with_prices)} products using batch processing")
        
        return jsonify({
            'status': 'success',
            'data': {
                'products': products_with_prices,
                'total': len(products_with_prices),
                'sorted_by': 'price_usd_desc',
                'message': f'Found {len(products_with_prices)} products sorted by price (high to low) using batch processing'
            }
        })
        
    except Exception as e:
        print(f"Exception in get_products_sorted_by_price_desc: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@main.route('/api/products/all', methods=['GET'])
def get_all_products():
    """Get all products from database as JSON without sorting"""
    try:
        # Get all product IDs from database
        product_ids = product_service.get_all_product_ids()
        
        if not product_ids:
            return jsonify({
                'status': 'success',
                'data': {
                    'products': [],
                    'total': 0,
                    'message': 'No products found in database'
                }
            })
        
        print(f"Found {len(product_ids)} products in database")
        
        # Fetch product details from AliExpress API
        all_products = []
        
        for i, product_id in enumerate(product_ids):
            try:
                print(f"Processing product {i+1}/{len(product_ids)}: {product_id}")
                
                # Get product details from AliExpress API
                product_details = product_service.get_single_product_details(product_id)
                
                if product_details:
                    # Create complete product object with all available information
                    product_data = {
                        'product_id': product_id,
                        'product_title': product_details.get('product_title', ''),
                        'sale_price': product_details.get('sale_price', ''),
                        'sale_price_currency': product_details.get('sale_price_currency', ''),
                        'original_price': product_details.get('original_price', ''),
                        'original_price_currency': product_details.get('original_price_currency', ''),
                        'target_sale_price': product_details.get('target_sale_price', ''),
                        'target_sale_price_currency': product_details.get('target_sale_price_currency', ''),
                        'target_original_price': product_details.get('target_original_price', ''),
                        'target_original_price_currency': product_details.get('target_original_price_currency', ''),
                        'app_sale_price': product_details.get('app_sale_price', ''),
                        'app_sale_price_currency': product_details.get('app_sale_price_currency', ''),
                        'target_app_sale_price': product_details.get('target_app_sale_price', ''),
                        'target_app_sale_price_currency': product_details.get('target_app_sale_price_currency', ''),
                        'product_main_image_url': product_details.get('product_main_image_url', ''),
                        'product_small_image_urls': product_details.get('product_small_image_urls', {}),
                        'product_video_url': product_details.get('product_video_url', ''),
                        'product_detail_url': product_details.get('product_detail_url', ''),
                        'promotion_link': product_details.get('promotion_link', ''),
                        'shop_id': product_details.get('shop_id', ''),
                        'shop_name': product_details.get('shop_name', ''),
                        'shop_url': product_details.get('shop_url', ''),
                        'sku_id': product_details.get('sku_id', ''),
                        'lastest_volume': product_details.get('lastest_volume', 0),
                        'discount': product_details.get('discount', ''),
                        'commission_rate': product_details.get('commission_rate', ''),
                        'hot_product_commission_rate': product_details.get('hot_product_commission_rate', ''),
                        'first_level_category_id': product_details.get('first_level_category_id', ''),
                        'first_level_category_name': product_details.get('first_level_category_name', ''),
                        'second_level_category_id': product_details.get('second_level_category_id', ''),
                        'second_level_category_name': product_details.get('second_level_category_name', ''),
                        'evaluate_rate': product_details.get('evaluate_rate', ''),
                        'rating_weighted': product_details.get('rating_weighted', ''),
                        'rating': product_details.get('rating', ''),
                        'score': product_details.get('score', ''),
                        'average_rating': product_details.get('average_rating', ''),
                        'rating_percent': product_details.get('rating_percent', ''),
                        'positive_feedback_rate': product_details.get('positive_feedback_rate', ''),
                        'avg_evaluation_rate': product_details.get('avg_evaluation_rate', ''),
                        'avg_rating_percent': product_details.get('avg_rating_percent', ''),
                        'product_description': product_details.get('product_description', ''),
                        'tax_rate': product_details.get('tax_rate', '')
                    }
                    
                    all_products.append(product_data)
                    
            except Exception as e:
                print(f"Error processing product {product_id}: {e}")
                continue
        
        print(f"Successfully processed {len(all_products)} products")
        
        return jsonify({
            'status': 'success',
            'data': {
                'products': all_products,
                'total': len(all_products),
                'message': f'Found {len(all_products)} products from database'
            }
        })
        
    except Exception as e:
        print(f"Exception in get_all_products: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@main.route('/api/products/all-batch', methods=['GET'])
def get_all_products_batch():
    """Get all products using batch processing for better performance"""
    try:
        # Get all product IDs from database
        product_ids = product_service.get_all_product_ids()
        
        if not product_ids:
            return jsonify({
                'status': 'success',
                'data': {
                    'products': [],
                    'total': 0,
                    'message': 'No products found in database'
                }
            })
        
        print(f"Found {len(product_ids)} products in database - using batch processing")
        
        # Try batch processing first
        batch_size = 10
        all_products = []
        
        for i in range(0, len(product_ids), batch_size):
            batch_ids = product_ids[i:i + batch_size]
            print(f"Processing batch {i//batch_size + 1}/{(len(product_ids) + batch_size - 1)//batch_size}: {len(batch_ids)} products")
            
            batch_products = product_service.get_multiple_products_batch(batch_ids, batch_size)
            
            if batch_products:
                all_products.extend(batch_products)
            else:
                # Fallback to individual requests if batch fails
                print(f"Batch failed for products {batch_ids}, falling back to individual requests")
                for product_id in batch_ids:
                    product_details = product_service.get_single_product_details(product_id)
                    if product_details:
                        all_products.append(product_details)
        
        print(f"Successfully processed {len(all_products)} products using batch processing")
        
        return jsonify({
            'status': 'success',
            'data': {
                'products': all_products,
                'total': len(all_products),
                'message': f'Found {len(all_products)} products from database using batch processing'
            }
        })
        
    except Exception as e:
        print(f"Exception in get_all_products_batch: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@main.route('/api/products/all-parallel', methods=['GET'])
def get_all_products_parallel():
    """Get all products using parallel processing for better performance"""
    try:
        # Get all product IDs from database
        product_ids = product_service.get_all_product_ids()
        
        if not product_ids:
            return jsonify({
                'status': 'success',
                'data': {
                    'products': [],
                    'total': 0,
                    'message': 'No products found in database'
                }
            })
        
        print(f"Found {len(product_ids)} products in database - using parallel processing")
        
        # Use parallel processing
        max_workers = 5  # Adjust based on API rate limits
        all_products = product_service.get_multiple_products_parallel(product_ids, max_workers)
        
        print(f"Successfully processed {len(all_products)} products using parallel processing")
        
        return jsonify({
            'status': 'success',
            'data': {
                'products': all_products,
                'total': len(all_products),
                'message': f'Found {len(all_products)} products from database using parallel processing'
            }
        })
        
    except Exception as e:
        print(f"Exception in get_all_products_parallel: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@main.route('/api/categories', methods=['GET'])
def get_all_categories():
    """Get all unique categories from product_category column in saved_products table"""
    try:
        # Get unique categories directly from database
        from database.repository import ProductRepository
        repository = ProductRepository()
        
        # Get unique categories from product_category column
        categories = repository.get_unique_categories()
        
        if not categories:
            return jsonify({
                'status': 'success',
                'data': {
                    'categories': [],
                    'total': 0,
                    'message': 'No categories found in database'
                }
            })
        
        print(f"Found {len(categories)} unique categories in database")
        
        return jsonify({
            'status': 'success',
            'data': {
                'categories': categories,
                'total': len(categories),
                'message': f'Found {len(categories)} unique categories from database'
            }
        })
        
    except Exception as e:
        print(f"Exception in get_all_categories: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@main.route('/api/products/sorted-by-price-eur', methods=['GET'])
def get_products_sorted_by_price_eur():
    """Get all products sorted by price (low to high) in EUR using batch processing"""
    try:
        # Get all product IDs from database
        product_ids = product_service.get_all_product_ids()
        
        if not product_ids:
            return jsonify({
                'status': 'success',
                'data': {
                    'products': [],
                    'total': 0,
                    'message': 'No products found in database'
                }
            })
        
        print(f"Found {len(product_ids)} products in database - using batch processing for EUR sorting")
        
        # Use batch processing to get all products at once with EUR currency
        batch_size = 10
        all_products = product_service.get_multiple_products_batch(product_ids, batch_size, 'EUR')
        
        # Filter out None values and process products with EUR prices
        products_with_prices = []
        
        for product in all_products:
            if product:
                # Extract price information
                sale_price = product.get('sale_price', '0')
                sale_price_currency = product.get('sale_price_currency', 'USD')
                target_sale_price = product.get('target_sale_price', sale_price)
                target_sale_price_currency = product.get('target_sale_price_currency', 'USD')
                
                # Convert to float for sorting (prioritize EUR, then USD)
                try:
                    if target_sale_price_currency == 'EUR' and target_sale_price:
                        price_eur = float(target_sale_price)
                    elif target_sale_price_currency == 'USD' and target_sale_price:
                        # Convert USD to EUR (approximate rate: 1 USD = 0.85 EUR)
                        price_eur = float(target_sale_price) * 0.85
                    elif sale_price_currency == 'EUR' and sale_price:
                        price_eur = float(sale_price)
                    elif sale_price_currency == 'USD' and sale_price:
                        # Convert USD to EUR
                        price_eur = float(sale_price) * 0.85
                    else:
                        # If no EUR or USD price available, skip this product
                        print(f"Skipping product - no EUR/USD price: {product.get('product_title', 'Unknown')} (target: {target_sale_price} {target_sale_price_currency}, sale: {sale_price} {sale_price_currency})")
                        continue
                except (ValueError, TypeError) as e:
                    print(f"Error converting price to float: {e}")
                    continue
                
                # Add EUR price for sorting
                product['price_eur'] = price_eur
                products_with_prices.append(product)
        
        # Sort products by price (low to high)
        products_with_prices.sort(key=lambda x: x['price_eur'])
        
        # Remove the temporary price_eur field from response
        for product in products_with_prices:
            del product['price_eur']
        
        print(f"Successfully processed {len(products_with_prices)} products using batch processing for EUR")
        
        return jsonify({
            'status': 'success',
            'data': {
                'products': products_with_prices,
                'total': len(products_with_prices),
                'sorted_by': 'price_eur_asc',
                'message': f'Found {len(products_with_prices)} products sorted by price (low to high) in EUR using batch processing'
            }
        })
        
    except Exception as e:
        print(f"Exception in get_products_sorted_by_price_eur: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@main.route('/api/products/sorted-by-price-eur-desc', methods=['GET'])
def get_products_sorted_by_price_eur_desc():
    """Get all products sorted by price (high to low) in EUR using batch processing"""
    try:
        # Get all product IDs from database
        product_ids = product_service.get_all_product_ids()
        
        if not product_ids:
            return jsonify({
                'status': 'success',
                'data': {
                    'products': [],
                    'total': 0,
                    'message': 'No products found in database'
                }
            })
        
        print(f"Found {len(product_ids)} products in database - using batch processing for EUR sorting")
        
        # Use batch processing to get all products at once with EUR currency
        batch_size = 10
        all_products = product_service.get_multiple_products_batch(product_ids, batch_size, 'EUR')
        
        # Filter out None values and process products with EUR prices
        products_with_prices = []
        
        for product in all_products:
            if product:
                # Extract price information
                sale_price = product.get('sale_price', '0')
                sale_price_currency = product.get('sale_price_currency', 'USD')
                target_sale_price = product.get('target_sale_price', sale_price)
                target_sale_price_currency = product.get('target_sale_price_currency', 'USD')
                
                # Convert to float for sorting (prioritize EUR, then USD)
                try:
                    if target_sale_price_currency == 'EUR' and target_sale_price:
                        price_eur = float(target_sale_price)
                    elif target_sale_price_currency == 'USD' and target_sale_price:
                        # Convert USD to EUR (approximate rate: 1 USD = 0.85 EUR)
                        price_eur = float(target_sale_price) * 0.85
                    elif sale_price_currency == 'EUR' and sale_price:
                        price_eur = float(sale_price)
                    elif sale_price_currency == 'USD' and sale_price:
                        # Convert USD to EUR
                        price_eur = float(sale_price) * 0.85
                    else:
                        # If no EUR or USD price available, skip this product
                        print(f"Skipping product - no EUR/USD price: {product.get('product_title', 'Unknown')} (target: {target_sale_price} {target_sale_price_currency}, sale: {sale_price} {sale_price_currency})")
                        continue
                except (ValueError, TypeError) as e:
                    print(f"Error converting price to float: {e}")
                    continue
                
                # Add EUR price for sorting
                product['price_eur'] = price_eur
                products_with_prices.append(product)
        
        # Sort products by price (high to low)
        products_with_prices.sort(key=lambda x: x['price_eur'], reverse=True)
        
        # Remove the temporary price_eur field from response
        for product in products_with_prices:
            del product['price_eur']
        
        print(f"Successfully processed {len(products_with_prices)} products using batch processing for EUR")
        
        return jsonify({
            'status': 'success',
            'data': {
                'products': products_with_prices,
                'total': len(products_with_prices),
                'sorted_by': 'price_eur_desc',
                'message': f'Found {len(products_with_prices)} products sorted by price (high to low) in EUR using batch processing'
            }
        })
        
    except Exception as e:
        print(f"Exception in get_products_sorted_by_price_eur_desc: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@main.route('/api/products/sorted-by-price-ils', methods=['GET'])
def get_products_sorted_by_price_ils():
    """Get all products sorted by price (low to high) in ILS using batch processing"""
    try:
        # Get all product IDs from database
        product_ids = product_service.get_all_product_ids()
        
        if not product_ids:
            return jsonify({
                'status': 'success',
                'data': {
                    'products': [],
                    'total': 0,
                    'message': 'No products found in database'
                }
            })
        
        print(f"Found {len(product_ids)} products in database - using batch processing for ILS sorting")
        
        # Use batch processing to get all products at once with ILS currency
        batch_size = 10
        all_products = product_service.get_multiple_products_batch(product_ids, batch_size, 'ILS')
        
        # Filter out None values and process products with ILS prices
        products_with_prices = []
        
        for product in all_products:
            if product:
                # Extract price information
                sale_price = product.get('sale_price', '0')
                sale_price_currency = product.get('sale_price_currency', 'USD')
                target_sale_price = product.get('target_sale_price', sale_price)
                target_sale_price_currency = product.get('target_sale_price_currency', 'USD')
                
                # Convert to float for sorting (prioritize ILS, then USD)
                try:
                    if target_sale_price_currency == 'ILS' and target_sale_price:
                        price_ils = float(target_sale_price)
                    elif target_sale_price_currency == 'USD' and target_sale_price:
                        # Convert USD to ILS (approximate rate: 1 USD = 3.7 ILS)
                        price_ils = float(target_sale_price) * 3.7
                    elif sale_price_currency == 'ILS' and sale_price:
                        price_ils = float(sale_price)
                    elif sale_price_currency == 'USD' and sale_price:
                        # Convert USD to ILS
                        price_ils = float(sale_price) * 3.7
                    else:
                        # If no ILS or USD price available, skip this product
                        print(f"Skipping product - no ILS/USD price: {product.get('product_title', 'Unknown')} (target: {target_sale_price} {target_sale_price_currency}, sale: {sale_price} {sale_price_currency})")
                        continue
                except (ValueError, TypeError) as e:
                    print(f"Error converting price to float: {e}")
                    continue
                
                # Add ILS price for sorting
                product['price_ils'] = price_ils
                products_with_prices.append(product)
        
        # Sort products by price (low to high)
        products_with_prices.sort(key=lambda x: x['price_ils'])
        
        # Remove the temporary price_ils field from response
        for product in products_with_prices:
            del product['price_ils']
        
        print(f"Successfully processed {len(products_with_prices)} products using batch processing for ILS")
        
        return jsonify({
            'status': 'success',
            'data': {
                'products': products_with_prices,
                'total': len(products_with_prices),
                'sorted_by': 'price_ils_asc',
                'message': f'Found {len(products_with_prices)} products sorted by price (low to high) in ILS using batch processing'
            }
        })
        
    except Exception as e:
        print(f"Exception in get_products_sorted_by_price_ils: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@main.route('/api/products/sorted-by-price-ils-desc', methods=['GET'])
def get_products_sorted_by_price_ils_desc():
    """Get all products sorted by price (high to low) in ILS using batch processing"""
    try:
        # Get all product IDs from database
        product_ids = product_service.get_all_product_ids()
        
        if not product_ids:
            return jsonify({
                'status': 'success',
                'data': {
                    'products': [],
                    'total': 0,
                    'message': 'No products found in database'
                }
            })
        
        print(f"Found {len(product_ids)} products in database - using batch processing for ILS sorting")
        
        # Use batch processing to get all products at once with ILS currency
        batch_size = 10
        all_products = product_service.get_multiple_products_batch(product_ids, batch_size, 'ILS')
        
        # Filter out None values and process products with ILS prices
        products_with_prices = []
        
        for product in all_products:
            if product:
                # Extract price information
                sale_price = product.get('sale_price', '0')
                sale_price_currency = product.get('sale_price_currency', 'USD')
                target_sale_price = product.get('target_sale_price', sale_price)
                target_sale_price_currency = product.get('target_sale_price_currency', 'USD')
                
                # Convert to float for sorting (prioritize ILS, then USD)
                try:
                    if target_sale_price_currency == 'ILS' and target_sale_price:
                        price_ils = float(target_sale_price)
                    elif target_sale_price_currency == 'USD' and target_sale_price:
                        # Convert USD to ILS (approximate rate: 1 USD = 3.7 ILS)
                        price_ils = float(target_sale_price) * 3.7
                    elif sale_price_currency == 'ILS' and sale_price:
                        price_ils = float(sale_price)
                    elif sale_price_currency == 'USD' and sale_price:
                        # Convert USD to ILS
                        price_ils = float(sale_price) * 3.7
                    else:
                        # If no ILS or USD price available, skip this product
                        print(f"Skipping product - no ILS/USD price: {product.get('product_title', 'Unknown')} (target: {target_sale_price} {target_sale_price_currency}, sale: {sale_price} {sale_price_currency})")
                        continue
                except (ValueError, TypeError) as e:
                    print(f"Error converting price to float: {e}")
                    continue
                
                # Add ILS price for sorting
                product['price_ils'] = price_ils
                products_with_prices.append(product)
        
        # Sort products by price (high to low)
        products_with_prices.sort(key=lambda x: x['price_ils'], reverse=True)
        
        # Remove the temporary price_ils field from response
        for product in products_with_prices:
            del product['price_ils']
        
        print(f"Successfully processed {len(products_with_prices)} products using batch processing for ILS")
        
        return jsonify({
            'status': 'success',
            'data': {
                'products': products_with_prices,
                'total': len(products_with_prices),
                'sorted_by': 'price_ils_desc',
                'message': f'Found {len(products_with_prices)} products sorted by price (high to low) in ILS using batch processing'
            }
        })
        
    except Exception as e:
        print(f"Exception in get_products_sorted_by_price_ils_desc: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@main.route('/api/products/filtered', methods=['GET'])
def get_products_filtered():
    """Get products filtered by category and sorted by price"""
    try:
        # Get query parameters
        category = request.args.get('category', '').strip()
        sort_order = request.args.get('sort_order', 'asc').strip().lower()  # asc or desc
        currency = request.args.get('currency', 'USD').strip().upper()  # USD, EUR, ILS
        limit = request.args.get('limit', type=int)  # Optional limit
        
        # Validate parameters
        if sort_order not in ['asc', 'desc']:
            return jsonify({
                'status': 'error',
                'message': 'sort_order must be "asc" or "desc"'
            }), 400
        
        if currency not in ['USD', 'EUR', 'ILS']:
            return jsonify({
                'status': 'error',
                'message': 'currency must be "USD", "EUR", or "ILS"'
            }), 400
        
        # Get all product IDs from database
        product_ids = product_service.get_all_product_ids()
        
        if not product_ids:
            return jsonify({
                'status': 'success',
                'data': {
                    'products': [],
                    'total': 0,
                    'filters': {
                        'category': category,
                        'sort_order': sort_order,
                        'currency': currency
                    },
                    'message': 'No products found in database'
                }
            })
        
        print(f"Found {len(product_ids)} products in database - filtering by category: '{category}', sorting: {sort_order}, currency: {currency}")
        
        # Use batch processing to get all products at once with specified currency
        batch_size = 10
        all_products = product_service.get_multiple_products_batch(product_ids, batch_size, currency)
        
        # Filter products by category if specified
        filtered_products = []
        if category:
            for product in all_products:
                if product:
                    # Check both first and second level categories
                    first_level = product.get('first_level_category_name', '').lower()
                    second_level = product.get('second_level_category_name', '').lower()
                    category_lower = category.lower()
                    
                    if category_lower in first_level or category_lower in second_level:
                        filtered_products.append(product)
        else:
            # No category filter, use all products
            filtered_products = [product for product in all_products if product is not None]
        
        # Sort products by price
        products_with_prices = []
        for product in filtered_products:
            if product:
                # Extract price information
                target_sale_price = product.get('target_sale_price', '0')
                target_sale_price_currency = product.get('target_sale_price_currency', currency)
                
                # Convert to float for sorting
                try:
                    if target_sale_price_currency == currency and target_sale_price:
                        price_value = float(target_sale_price)
                    else:
                        # Skip products without the requested currency
                        continue
                except (ValueError, TypeError) as e:
                    print(f"Error converting price to float: {e}")
                    continue
                
                # Add price for sorting
                product['sort_price'] = price_value
                products_with_prices.append(product)
        
        # Sort products by price
        if sort_order == 'desc':
            products_with_prices.sort(key=lambda x: x['sort_price'], reverse=True)
        else:  # asc
            products_with_prices.sort(key=lambda x: x['sort_price'])
        
        # Remove the temporary sort_price field from response
        for product in products_with_prices:
            del product['sort_price']
        
        # Apply limit if specified
        if limit and limit > 0:
            products_with_prices = products_with_prices[:limit]
        
        print(f"Successfully processed {len(products_with_prices)} products with filters")
        
        return jsonify({
            'status': 'success',
            'data': {
                'products': products_with_prices,
                'total': len(products_with_prices),
                'filters': {
                    'category': category,
                    'sort_order': sort_order,
                    'currency': currency,
                    'limit': limit
                },
                'message': f'Found {len(products_with_prices)} products filtered by category "{category}" and sorted by price ({sort_order}) in {currency}'
            }
        })
        
    except Exception as e:
        print(f"Exception in get_products_filtered: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@main.route('/api/products/with-video', methods=['GET'])
def get_products_with_video():
    """Get all products that have video using batch processing"""
    try:
        # Get product IDs that have video from database
        from database.repository import ProductRepository
        repository = ProductRepository()
        
        # Get product IDs with video
        product_ids = repository.get_product_ids_with_video()
        
        if not product_ids:
            return jsonify({
                'status': 'success',
                'data': {
                    'products': [],
                    'total': 0,
                    'message': 'No products with video found in database'
                }
            })
        
        print(f"Found {len(product_ids)} products with video in database")
        
        # Use batch processing to get full product details
        batch_size = 10
        all_products = product_service.get_multiple_products_batch(product_ids, batch_size)
        
        # Filter out None values and ensure we have valid products
        valid_products = [product for product in all_products if product is not None]
        
        print(f"Successfully retrieved {len(valid_products)} products with video details")
        
        return jsonify({
            'status': 'success',
            'data': {
                'products': valid_products,
                'total': len(valid_products),
                'total_with_video_in_db': len(product_ids),
                'message': f'Found {len(valid_products)} products with video from {len(product_ids)} products in database'
            }
        })
        
    except Exception as e:
        print(f"Exception in get_products_with_video: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@main.route('/api/products/comprehensive-filter', methods=['GET'])
def get_products_comprehensive_filter():
    """Get products with comprehensive filtering including video toggle"""
    try:
        # Get query parameters
        category = request.args.get('category', '').strip()
        sort_order = request.args.get('sort_order', 'asc').strip().lower()  # asc or desc
        currency = request.args.get('currency', 'USD').strip().upper()  # USD, EUR, ILS, etc.
        limit = request.args.get('limit', type=int)  # Optional limit
        just_video = request.args.get('JustVideo', '0').strip()  # 1 for video only, 0 for all
        min_price = request.args.get('min_price', type=float)  # Optional minimum price
        max_price = request.args.get('max_price', type=float)  # Optional maximum price
        
        # Validate parameters
        if sort_order not in ['asc', 'desc']:
            return jsonify({
                'status': 'error',
                'message': 'sort_order must be "asc" or "desc"'
            }), 400
        
        if currency not in ['USD', 'EUR', 'ILS', 'CNY', 'JPY', 'GBP']:
            return jsonify({
                'status': 'error',
                'message': 'currency must be one of: USD, EUR, ILS, CNY, JPY, GBP'
            }), 400
        
        # Validate price range
        if min_price is not None and min_price < 0:
            return jsonify({
                'status': 'error',
                'message': 'min_price must be a positive number'
            }), 400
        
        if max_price is not None and max_price < 0:
            return jsonify({
                'status': 'error',
                'message': 'max_price must be a positive number'
            }), 400
        
        if min_price is not None and max_price is not None and min_price > max_price:
            return jsonify({
                'status': 'error',
                'message': 'min_price cannot be greater than max_price'
            }), 400
        
        # Get product IDs based on video filter
        if just_video == '1':
            # Get only products with video
            from database.repository import ProductRepository
            repository = ProductRepository()
            product_ids = repository.get_product_ids_with_video()
            print(f"Found {len(product_ids)} products with video in database")
        else:
            # Get all product IDs
            product_ids = product_service.get_all_product_ids()
            print(f"Found {len(product_ids)} products in database")
        
        if not product_ids:
            return jsonify({
                'status': 'success',
                'data': {
                    'products': [],
                    'total': 0,
                    'filters': {
                        'category': category,
                        'sort_order': sort_order,
                        'currency': currency,
                        'limit': limit,
                        'just_video': just_video
                    },
                    'message': 'No products found in database'
                }
            })
        
        print(f"Comprehensive filtering - category: '{category}', sorting: {sort_order}, currency: {currency}, video_only: {just_video == '1'}, price_range: {min_price}-{max_price}")
        
        # Use batch processing to get all products at once with specified currency
        batch_size = 10
        all_products = product_service.get_multiple_products_batch(product_ids, batch_size, currency)
        
        # Get custom titles from database
        from database.repository import ProductRepository
        repository = ProductRepository()
        # Convert product_ids to integers for database query
        int_product_ids = [int(pid) for pid in product_ids]
        custom_titles = repository.get_custom_titles(int_product_ids)
        print(f"DEBUG: product_ids type: {type(product_ids)}, first item: {product_ids[0] if product_ids else 'empty'}, type: {type(product_ids[0]) if product_ids else 'N/A'}")
        print(f"DEBUG: int_product_ids: {int_product_ids}")
        print(f"DEBUG: custom_titles from DB: {custom_titles}")
        
        # Note: Custom titles will be applied later after filtering
        
        # Filter products by category if specified
        filtered_products = []
        if category and category.lower() != 'all':
            for product in all_products:
                if product:
                    # Check both first and second level categories
                    first_level = product.get('first_level_category_name', '').lower()
                    second_level = product.get('second_level_category_name', '').lower()
                    category_lower = category.lower()
                    
                    if category_lower in first_level or category_lower in second_level:
                        filtered_products.append(product)
        else:
            # No category filter or category=all, use all products
            filtered_products = [product for product in all_products if product is not None]
        
        # Sort products by price and apply price filters
        products_with_prices = []
        for product in filtered_products:
            if product:
                # Extract price information
                target_sale_price = product.get('target_sale_price', '0')
                target_sale_price_currency = product.get('target_sale_price_currency', currency)
                
                # Convert to float for sorting and filtering
                try:
                    if target_sale_price_currency == currency and target_sale_price:
                        price_value = float(target_sale_price)
                    else:
                        # Skip products without the requested currency
                        continue
                except (ValueError, TypeError) as e:
                    print(f"Error converting price to float: {e}")
                    continue
                
                # Apply price range filters
                if min_price is not None and price_value < min_price:
                    continue
                if max_price is not None and price_value > max_price:
                    continue
                
                # Add price for sorting
                product['sort_price'] = price_value
                products_with_prices.append(product)
        
        # Sort products by price
        if sort_order == 'desc':
            products_with_prices.sort(key=lambda x: x['sort_price'], reverse=True)
        else:  # asc
            products_with_prices.sort(key=lambda x: x['sort_price'])
        
        # Remove the temporary sort_price field from response
        for product in products_with_prices:
            del product['sort_price']
        
        # Apply limit if specified
        if limit and limit > 0:
            products_with_prices = products_with_prices[:limit]
        
        # Simple approach: Get custom titles for final products and apply them
        final_product_ids = [int(product.get('product_id')) for product in products_with_prices if product and product.get('product_id')]
        print(f"Final product IDs: {final_product_ids}")
        print(f"Final product IDs type: {type(final_product_ids)}")
        print(f"First product ID: {final_product_ids[0] if final_product_ids else 'empty'}")
        print(f"First product ID type: {type(final_product_ids[0]) if final_product_ids else 'N/A'}")
        
        # Get custom titles for final products
        final_custom_titles = repository.get_custom_titles(final_product_ids)
        print(f"Final custom titles: {final_custom_titles}")
        print(f"Final custom titles type: {type(final_custom_titles)}")
        print(f"Final custom titles keys: {list(final_custom_titles.keys()) if final_custom_titles else 'empty'}")
        print(f"First key type: {type(list(final_custom_titles.keys())[0]) if final_custom_titles else 'N/A'}")
        
        # Apply custom titles to final products
        for product in products_with_prices:
            product_id = int(product.get('product_id')) if product and product.get('product_id') else None
            print(f"DEBUG: product_id = {product_id}, type = {type(product_id)}")
            print(f"DEBUG: final_custom_titles keys = {list(final_custom_titles.keys())}")
            print(f"DEBUG: final_custom_titles keys types = {[type(k) for k in final_custom_titles.keys()]}")
            print(f"DEBUG: product_id in final_custom_titles = {product_id in final_custom_titles}")
            
            # Try both integer and string keys
            if product_id and (product_id in final_custom_titles or str(product_id) in final_custom_titles):
                # Use the correct key type
                key = product_id if product_id in final_custom_titles else str(product_id)
                product['product_title'] = final_custom_titles[key]
                product['custom_title'] = final_custom_titles[key]
                print(f"Applied custom title for product {product['product_id']}: {final_custom_titles[key]}")
            else:
                # Add empty custom_title field for products without custom title
                product['custom_title'] = None
                print(f"No custom title for product {product['product_id']}")
        
        print(f"Successfully processed {len(products_with_prices)} products with comprehensive filters")
        
        # Create message based on filters
        message_parts = []
        if category and category.lower() != 'all':
            message_parts.append(f'filtered by category "{category}"')
        if just_video == '1':
            message_parts.append('with video only')
        if min_price is not None or max_price is not None:
            price_range = []
            if min_price is not None:
                price_range.append(f'min: {min_price}')
            if max_price is not None:
                price_range.append(f'max: {max_price}')
            message_parts.append(f'price range ({", ".join(price_range)})')
        if not message_parts:
            message_parts.append('from all categories')
        
        message = f'Found {len(products_with_prices)} products {", ".join(message_parts)} and sorted by price ({sort_order}) in {currency}'
        
        return jsonify({
            'status': 'success',
            'data': {
                'products': products_with_prices,
                'total': len(products_with_prices),
                'filters': {
                    'category': category,
                    'sort_order': sort_order,
                    'currency': currency,
                    'limit': limit,
                    'just_video': just_video,
                    'min_price': min_price,
                    'max_price': max_price
                },
                'message': message
            }
        })
        
    except Exception as e:
        print(f"Exception in get_products_comprehensive_filter: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@main.route('/api/test/currency', methods=['GET'])
def test_currency_conversion():
    """Test currency conversion with different currencies"""
    try:
        from services.aliexpress_service import AliExpressService
        service = AliExpressService()
        
        # Test with a simple product ID
        test_product_id = "1005009551106721"
        
        # Test different currencies
        currencies = ['USD', 'EUR', 'ILS', 'CNY', 'JPY', 'GBP']
        results = {}
        
        for currency in currencies:
            try:
                result = service.get_single_product(test_product_id, currency)
                if result:
                    results[currency] = {
                        'target_sale_price': result.get('target_sale_price'),
                        'target_sale_price_currency': result.get('target_sale_price_currency'),
                        'target_original_price': result.get('target_original_price'),
                        'target_original_price_currency': result.get('target_original_price_currency'),
                        'original_price': result.get('original_price'),
                        'original_price_currency': result.get('original_price_currency'),
                        'sale_price': result.get('sale_price'),
                        'sale_price_currency': result.get('sale_price_currency')
                    }
                else:
                    results[currency] = {'error': 'No data returned'}
            except Exception as e:
                results[currency] = {'error': str(e)}
        
        return jsonify({
            'status': 'success',
            'message': 'Currency conversion test completed',
            'test_product_id': test_product_id,
            'results': results
        })
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error testing currency conversion: {str(e)}'
        }), 500

@main.route('/api/test/custom-titles', methods=['GET'])
def test_custom_titles():
    """Get all product IDs that have custom_title in database"""
    try:
        from database.repository import ProductRepository
        repository = ProductRepository()
        
        # Get all product IDs that have custom_title
        product_ids_with_custom_titles = repository.get_product_ids_with_custom_titles()
        
        return jsonify({
            'status': 'success',
            'data': {
                'product_ids': product_ids_with_custom_titles,
                'total_products_with_custom_titles': len(product_ids_with_custom_titles)
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error fetching product IDs with custom titles: {str(e)}'
        }), 500

@main.route('/api/test/custom-titles-detail', methods=['GET'])
def test_custom_titles_detail():
    """Test get_custom_titles method with specific product ID"""
    try:
        from database.repository import ProductRepository
        repository = ProductRepository()
        
        # Test with specific product ID
        test_product_id = 1005009976684092
        custom_titles = repository.get_custom_titles([test_product_id])
        
        return jsonify({
            'status': 'success',
            'data': {
                'test_product_id': test_product_id,
                'custom_titles': custom_titles,
                'has_custom_title': test_product_id in custom_titles
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error testing custom titles: {str(e)}'
        }), 500

@main.route('/api/test/custom-titles-final', methods=['GET'])
def test_custom_titles_final():
    """Test the exact same logic as comprehensive filter"""
    try:
        from database.repository import ProductRepository
        repository = ProductRepository()
        
        # Test with the exact same logic as comprehensive filter
        final_product_ids = [1005009976684092]  # Same product ID
        print(f"Test Final product IDs: {final_product_ids}")
        print(f"Test Final product IDs type: {type(final_product_ids)}")
        print(f"Test First product ID: {final_product_ids[0] if final_product_ids else 'empty'}")
        print(f"Test First product ID type: {type(final_product_ids[0]) if final_product_ids else 'N/A'}")
        
        final_custom_titles = repository.get_custom_titles(final_product_ids)
        print(f"Test Final custom titles: {final_custom_titles}")
        print(f"Test Final custom titles type: {type(final_custom_titles)}")
        print(f"Test Final custom titles keys: {list(final_custom_titles.keys()) if final_custom_titles else 'empty'}")
        print(f"Test First key type: {type(list(final_custom_titles.keys())[0]) if final_custom_titles else 'N/A'}")
        
        return jsonify({
            'status': 'success',
            'data': {
                'final_product_ids': final_product_ids,
                'final_custom_titles': final_custom_titles,
                'test_product_id': 1005009976684092,
                'has_custom_title': 1005009976684092 in final_custom_titles
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error testing final custom titles: {str(e)}'
        }), 500

@main.route('/api/test/custom-titles-simulation', methods=['GET'])
def test_custom_titles_simulation():
    """Simulate the exact same logic as comprehensive filter"""
    try:
        from database.repository import ProductRepository
        repository = ProductRepository()
        
        # Simulate the exact same logic as comprehensive filter
        # This is what happens in the comprehensive filter
        final_product_ids = [1005009976684092]  # Same product ID
        print(f"Simulation Final product IDs: {final_product_ids}")
        
        final_custom_titles = repository.get_custom_titles(final_product_ids)
        print(f"Simulation Final custom titles: {final_custom_titles}")
        
        # Simulate the product dictionary
        product = {
            'product_id': '1005009976684092',  # This is a string from API
            'product_title': 'Wireless Bluetooth Headphones...',
            'target_sale_price': '16.52',
            'target_sale_price_currency': 'USD'
        }
        
        # Apply custom titles to product (same logic as comprehensive filter)
        product_id = int(product.get('product_id')) if product and product.get('product_id') else None
        print(f"Simulation product_id: {product_id}")
        print(f"Simulation product_id type: {type(product_id)}")
        print(f"Simulation product_id in final_custom_titles: {product_id in final_custom_titles}")
        
        if product_id and product_id in final_custom_titles:
            product['product_title'] = final_custom_titles[product_id]
            product['custom_title'] = final_custom_titles[product_id]
            print(f"Simulation Applied custom title: {final_custom_titles[product_id]}")
        else:
            product['custom_title'] = None
            print(f"Simulation No custom title applied")
        
        return jsonify({
            'status': 'success',
            'data': {
                'final_product_ids': final_product_ids,
                'final_custom_titles': final_custom_titles,
                'product': product,
                'product_id': product_id,
                'has_custom_title': product_id in final_custom_titles
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error testing simulation: {str(e)}'
        }), 500

@main.route('/api/test/debug-comprehensive', methods=['GET'])
def test_debug_comprehensive():
    """Debug the comprehensive filter logic step by step"""
    try:
        from database.repository import ProductRepository
        repository = ProductRepository()
        
        # Step 1: Get product IDs from database
        product_ids = repository.get_product_ids_with_custom_titles()
        print(f"Step 1 - Product IDs with custom titles: {product_ids}")
        
        # Step 2: Get custom titles
        custom_titles = repository.get_custom_titles(product_ids)
        print(f"Step 2 - Custom titles: {custom_titles}")
        
        # Step 3: Simulate product from API
        product = {
            'product_id': '1005009976684092',  # String from API
            'product_title': 'Wireless Bluetooth Headphones...',
            'target_sale_price': '16.52',
            'target_sale_price_currency': 'USD'
        }
        
        # Step 4: Apply custom title
        product_id = int(product.get('product_id'))
        print(f"Step 4 - Product ID: {product_id}, Type: {type(product_id)}")
        print(f"Step 4 - Custom titles keys: {list(custom_titles.keys())}")
        print(f"Step 4 - Custom titles keys types: {[type(k) for k in custom_titles.keys()]}")
        print(f"Step 4 - Product ID in custom titles: {product_id in custom_titles}")
        
        if product_id in custom_titles:
            product['custom_title'] = custom_titles[product_id]
            print(f"Step 4 - Applied custom title: {custom_titles[product_id]}")
        else:
            product['custom_title'] = None
            print(f"Step 4 - No custom title applied")
        
        return jsonify({
            'status': 'success',
            'data': {
                'step1_product_ids': product_ids,
                'step2_custom_titles': custom_titles,
                'step3_product': product,
                'step4_product_id': product_id,
                'step4_has_custom_title': product_id in custom_titles
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error in debug: {str(e)}'
        }), 500

@main.route('/api/test/credentials', methods=['GET'])
def test_credentials():
    """Test AliExpress API credentials"""
    try:
        from services.aliexpress_service import AliExpressService
        service = AliExpressService()
        
        # Test with a simple API call
        test_params = {
            'app_key': service.app_key,
            'method': 'aliexpress.affiliate.product.smartmatch',
            'format': 'json',
            'v': '2.0',
            'sign_method': 'md5',
            'timestamp': str(int(time.time() * 1000)),
            'tracking_id': service.tracking_id,
            'keywords': 'test',
            'page_size': 1
        }
        
        signature = service._generate_signature(test_params)
        test_params['sign'] = signature
        
        print(f"Test API call with params: {test_params}")
        
        return jsonify({
            'status': 'success',
            'data': {
                'app_key': service.app_key,
                'tracking_id': service.tracking_id,
                'api_url': service.base_url,
                'test_params': test_params
            }
        })
        
    except Exception as e:
        print(f"Exception in test_credentials: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
