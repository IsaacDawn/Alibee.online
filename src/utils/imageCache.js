// Global image cache to prevent re-downloading images
class ImageCache {
  constructor() {
    this.cache = new Map(); // URL -> Image element
    this.loading = new Set(); // URLs currently loading
    this.loaded = new Set(); // URLs that are loaded
  }

  // Preload an image and cache it
  async preloadImage(url) {
    if (!url) return null;

    // If already cached, return immediately
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    // If already loading, wait for it
    if (this.loading.has(url)) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.cache.has(url)) {
            clearInterval(checkInterval);
            resolve(this.cache.get(url));
          } else if (!this.loading.has(url)) {
            clearInterval(checkInterval);
            resolve(null);
          }
        }, 50);
      });
    }

    // Start loading
    this.loading.add(url);
    
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      
      img.onload = () => {
        this.cache.set(url, img);
        this.loaded.add(url);
        this.loading.delete(url);
        console.log(`[ImageCache] ✓ Cached image: ${url.substring(0, 50)}...`);
        resolve(img);
      };
      
      img.onerror = () => {
        this.loading.delete(url);
        console.warn(`[ImageCache] ✗ Failed to cache image: ${url.substring(0, 50)}...`);
        resolve(null);
      };
    });
  }

  // Check if image is cached
  isCached(url) {
    return this.cache.has(url) || this.loaded.has(url);
  }

  // Get cached image
  getCached(url) {
    return this.cache.get(url);
  }

  // Preload multiple images
  async preloadImages(urls) {
    return Promise.all(urls.map(url => this.preloadImage(url)));
  }

  // Clear cache (optional, for memory management)
  clear() {
    this.cache.clear();
    this.loading.clear();
    this.loaded.clear();
  }
}

// Export singleton instance
export const imageCache = new ImageCache();
export default imageCache;

