/**
 * Gallery Loader - Pure JavaScript solution for loading gallery images
 */

class GalleryLoader {
    constructor(galleryPath = 'images/gallery/') {
        this.galleryPath = galleryPath;
        // Known images in the gallery - these will be checked individually
        this.knownImages = [
            'WhatsApp Image 2025-07-26 at 9.33.36 PM.jpeg',
            'WhatsApp Image 2025-07-26 at 9.38.03 PM (1).jpeg',
            'WhatsApp Image 2025-07-26 at 9.38.03 PM.jpeg',
            'WhatsApp Image 2025-07-26 at 9.38.04 PM (1).jpeg',
            'WhatsApp Image 2025-07-26 at 9.38.04 PM.jpeg',
            'WhatsApp Image 2025-07-26 at 9.38.05 PM.jpeg',
            'WhatsApp Image 2025-07-26 at 9.38.06 PM (1).jpeg',
            'WhatsApp Image 2025-07-26 at 9.38.06 PM.jpeg'
        ];
    }
    
    /**
     * Load gallery images
     * @returns {Promise} Promise that resolves with an array of image objects
     */
    async loadImages() {
        try {
            // First, try to list the directory contents
            const directoryListing = await this.fetchDirectoryListing();
            let images = [];
            
            if (directoryListing) {
                // Parse HTML to extract image files
                const imageFiles = this.extractImageFilesFromListing(directoryListing);
                
                if (imageFiles && imageFiles.length > 0) {
                    // Create image objects from directory listing
                    images = this.createImageObjects(imageFiles);
                    
                    if (images.length > 0) {
                        return images;
                    }
                }
            }
            
            // If directory listing fails or returns no images, check known images individually
            console.log('Directory listing failed or empty, checking known images individually');
            images = await this.checkKnownImagesIndividually();
            
            if (images.length > 0) {
                return images;
            } else {
                console.error('No gallery images found');
                return [];
            }
            
        } catch (error) {
            console.error('Error loading gallery images:', error);
            // Try one last approach - check known images individually
            return await this.checkKnownImagesIndividually();
        }
    }
    
    /**
     * Create image objects from file paths
     */
    createImageObjects(filePaths) {
        return filePaths.map(file => {
            // Generate a readable alt text from the filename
            const fileName = file.split('/').pop();
            const nameWithoutExtension = fileName.split('.')[0];
            const altText = nameWithoutExtension
                .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                .replace(/[_-]/g, ' ')      // Replace underscores and hyphens with spaces
                .replace(/\s+/g, ' ')       // Replace multiple spaces with a single space
                .trim();                    // Remove leading/trailing spaces
            
            return {
                src: file,
                alt: altText || 'Gallery Image'
            };
        });
    }
    
    /**
     * Check if each known image exists and return only those that do
     */
    async checkKnownImagesIndividually() {
        const existingImages = [];
        
        // Check each image individually
        for (const fileName of this.knownImages) {
            const imagePath = this.galleryPath + fileName;
            const exists = await this.checkImageExists(imagePath);
            
            if (exists) {
                const nameWithoutExtension = fileName.split('.')[0];
                const altText = nameWithoutExtension
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/[_-]/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                
                existingImages.push({
                    src: imagePath,
                    alt: altText || 'Gallery Image'
                });
            }
        }
        
        return existingImages;
    }
    
    /**
     * Get all known images without checking if they exist
     * This is a fallback but may cause 404 errors if images don't exist
     */
    getKnownImages() {
        return this.knownImages.map(fileName => {
            const nameWithoutExtension = fileName.split('.')[0];
            const altText = nameWithoutExtension
                .replace(/([A-Z])/g, ' $1')
                .replace(/[_-]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            return {
                src: this.galleryPath + fileName,
                alt: altText || 'Gallery Image'
            };
        });
    }
    
    /**
     * Fetch the directory listing
     * Note: This only works if directory listing is enabled on the server
     */
    async fetchDirectoryListing() {
        try {
            const response = await fetch(this.galleryPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error fetching directory listing:', error);
            return null;
        }
    }
    
    /**
     * Extract image files from directory listing HTML
     */
    extractImageFilesFromListing(html) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const imageFiles = [];
        
        try {
            // Create a DOM parser
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Find all links in the directory listing
            const links = doc.querySelectorAll('a');
            
            // Extract image files
            links.forEach(link => {
                const href = link.getAttribute('href');
                
                // Check if the href is an image file
                if (href && imageExtensions.some(ext => href.toLowerCase().endsWith(ext))) {
                    // Make sure we don't include parent directory links
                    if (href !== '../' && href !== './') {
                        imageFiles.push(this.galleryPath + href);
                    }
                }
            });
            
            return imageFiles;
        } catch (error) {
            console.error('Error parsing directory listing:', error);
            return [];
        }
    }
    
    /**
     * Check if an image exists by trying to load it
     */
    checkImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
            
            // Set a timeout in case the image takes too long to load
            setTimeout(() => resolve(false), 3000);
        });
    }
}

// Export the class
window.GalleryLoader = GalleryLoader; 
