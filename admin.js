document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for page unload/refresh
    window.addEventListener('beforeunload', function() {
        // Clear login state on page unload/refresh
        sessionStorage.removeItem('adminLoggedIn');
    });
    // DOM Elements
    const loginSection = document.getElementById('login-section');
    const adminPanel = document.getElementById('admin-panel');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const uploadForm = document.getElementById('upload-form');
    const uploadStatus = document.getElementById('upload-status');
    const saveOrderBtn = document.getElementById('save-order-btn');
    const resetGalleryBtn = document.getElementById('reset-gallery-btn');
    const manageStatus = document.getElementById('manage-status');
    const galleryItems = document.getElementById('gallery-items');
    
    // Admin password
    const ADMIN_PASSWORD = '9876';
    
    // Always start with logged out state on page reload
    sessionStorage.removeItem('adminLoggedIn');
    adminPanel.classList.add('hidden');
    loginSection.classList.remove('hidden');
    passwordInput.value = '';
    
    // Initialize sortable gallery
    let sortable = null;
    
    // Function to handle login attempt
    function attemptLogin() {
        if (passwordInput.value === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showAdminPanel();
            loadGalleryImages();
        } else {
            loginError.textContent = 'Incorrect password. Please try again.';
        }
    }
    
    // Login button click
    loginBtn.addEventListener('click', attemptLogin);
    
    // Enter key in password field
    passwordInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            attemptLogin();
        }
    });
    
    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        sessionStorage.removeItem('adminLoggedIn');
        adminPanel.classList.add('hidden');
        loginSection.classList.remove('hidden');
        passwordInput.value = '';
    });
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            console.log('Switching to tab:', tabId);
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected tab content
            tabContents.forEach(content => content.classList.add('hidden'));
            const tabContent = document.getElementById(tabId + '-section');
            tabContent.classList.remove('hidden');
            
            // If manage tab is selected, load gallery images
            if (tabId === 'manage') {
                console.log('Loading gallery images for manage tab');
                setTimeout(loadGalleryImages, 100); // Small delay to ensure DOM is ready
            }
        });
    });
    
    // Upload form submission
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('image-file');
        const titleInput = document.getElementById('image-title');
        
        if (!fileInput.files.length) {
            showUploadStatus('Please select an image file.', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        const title = titleInput.value || 'Gallery Image';
        
        console.log('Uploading file:', file.name, 'Size:', Math.round(file.size / 1024) + 'KB');
        
        // In a real application, you would upload the file to a server
        // For this demo, we'll simulate storing in localStorage
        
        // Read file as data URL
        const reader = new FileReader();
        reader.onload = function(event) {
            const imageData = event.target.result;
            
            // Get existing gallery images
            let galleryImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
            console.log('Current gallery images:', galleryImages.length);
            
            // Add new image
            const newImage = {
                id: Date.now().toString(),
                src: imageData,
                title: title,
                alt: title
            };
            galleryImages.push(newImage);
            
            // Save to localStorage
            try {
                localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
                console.log('Image saved to localStorage. New count:', galleryImages.length);
                
                // Show success message
                showUploadStatus('Image uploaded successfully!', 'success');
                
                // Reset form
                uploadForm.reset();
                
                // Load gallery images to update the UI
                loadGalleryImages();
                
                // Update the main gallery on the index page without triggering a reload
                localStorage.setItem('galleryUpdated', Date.now().toString());
            } catch (e) {
                console.error('Error saving to localStorage:', e);
                showUploadStatus('Error saving image. The file might be too large for localStorage.', 'error');
            }
        };
        
        reader.onerror = function() {
            console.error('Error reading file');
            showUploadStatus('Error reading file. Please try again.', 'error');
        };
        
        reader.readAsDataURL(file);
    });
    
    // Save gallery order
    saveOrderBtn.addEventListener('click', function() {
        const items = document.querySelectorAll('.gallery-item');
        const newOrder = [];
        
        items.forEach(item => {
            const id = item.getAttribute('data-id');
            const galleryImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
            const image = galleryImages.find(img => img.id === id);
            
            if (image) {
                newOrder.push(image);
            }
        });
        
        localStorage.setItem('galleryImages', JSON.stringify(newOrder));
        showManageStatus('Gallery order saved successfully!', 'success');
        
        // Update the main gallery on the index page without triggering a reload
        localStorage.setItem('galleryUpdated', Date.now().toString());
    });
    
    // Reset gallery to default images
    resetGalleryBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the gallery to default images? This will remove any custom uploaded images.')) {
            try {
                // Re-initialize with default images
                initializeGallery();
                
                // Reload gallery images
                loadGalleryImages();
                
                // Show success message
                showManageStatus('Gallery reset to default images successfully!', 'success');
                
                // Update the main gallery on the index page without triggering a reload
                localStorage.setItem('galleryUpdated', Date.now().toString());
            } catch (e) {
                console.error('Error resetting gallery:', e);
                showManageStatus('Error resetting gallery. Please try again.', 'error');
            }
        }
    });
    
    // Helper functions
    function showAdminPanel() {
        loginSection.classList.add('hidden');
        adminPanel.classList.remove('hidden');
    }
    
    function showUploadStatus(message, type) {
        uploadStatus.textContent = message;
        uploadStatus.className = 'status-message ' + type;
        
        // Clear message after 3 seconds
        setTimeout(() => {
            uploadStatus.textContent = '';
            uploadStatus.className = 'status-message';
        }, 3000);
    }
    
    function showManageStatus(message, type) {
        manageStatus.textContent = message;
        manageStatus.className = 'status-message ' + type;
        
        // Clear message after 3 seconds
        setTimeout(() => {
            manageStatus.textContent = '';
            manageStatus.className = 'status-message';
        }, 3000);
    }
    
    function loadGalleryImages() {
        // Get gallery images from localStorage
        const galleryImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
        
        // Clear existing items
        galleryItems.innerHTML = '';
        
        // Show message if no images
        if (galleryImages.length === 0) {
            galleryItems.innerHTML = '<div class="no-images-message">No images in the gallery. Upload some images first.</div>';
            return;
        }
        
        // Add images to gallery
        galleryImages.forEach(image => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.setAttribute('data-id', image.id);
            
            // Create image element with proper error handling
            const img = document.createElement('img');
            img.src = image.src;
            img.alt = image.alt || image.title;
            img.onerror = function() {
                this.src = 'https://via.placeholder.com/150?text=Image+Error';
            };
            
            // Create title and remove button
            const titleDiv = document.createElement('div');
            titleDiv.className = 'item-title';
            titleDiv.textContent = image.title;
            
            const removeBtn = document.createElement('div');
            removeBtn.className = 'remove-btn';
            removeBtn.setAttribute('data-id', image.id);
            removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
            
            // Append all elements
            item.appendChild(img);
            item.appendChild(titleDiv);
            item.appendChild(removeBtn);
            galleryItems.appendChild(item);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = this.getAttribute('data-id');
                removeImage(id);
            });
        });
        
        // Initialize sortable if not already initialized
        if (sortable) {
            sortable.destroy();
        }
        
        sortable = new Sortable(galleryItems, {
            animation: 150,
            ghostClass: 'sortable-ghost'
        });
        
        console.log('Gallery images loaded:', galleryImages.length);
    }
    
    function removeImage(id) {
        // Get gallery images from localStorage
        let galleryImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
        
        // Remove image with matching id
        galleryImages = galleryImages.filter(image => image.id !== id);
        
        // Save updated images to localStorage
        localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
        
        // Reload gallery images
        loadGalleryImages();
        
        // Show success message
        showManageStatus('Image removed successfully!', 'success');
        
        // Update the main gallery on the index page without triggering a reload
        localStorage.setItem('galleryUpdated', Date.now().toString());
    }
    
    function updateMainGallery() {
        // In a real-world application with a server, we would make an API call
        // For this client-side demo, we'll just trigger a refresh if index.html is open
        console.log('Main gallery updated with new images/order');
        
        // If the main page is open in another tab, we could use localStorage to signal a refresh
        localStorage.setItem('galleryUpdated', Date.now().toString());
        
        // We'll avoid trying to access the opener window directly as it can cause refresh loops
        // The main page will detect changes through localStorage polling
    }
    
    // Initialize gallery with default images from images folder
    function initializeGallery() {
        console.log('Initializing gallery with default images');
        
        // Default images from the images folder
        const defaultImages = [
            {
                src: 'images/WhatsApp Image 2025-07-26 at 9.38.03 PM.jpeg',
                title: 'Children Playing',
                alt: 'Children Playing'
            },
            {
                src: 'images/WhatsApp Image 2025-07-26 at 9.38.03 PM (1).jpeg',
                title: 'Preschool Activity',
                alt: 'Preschool Activity'
            },
            {
                src: 'images/WhatsApp Image 2025-07-26 at 9.38.04 PM.jpeg',
                title: 'Nursery Program',
                alt: 'Nursery Program'
            },
            {
                src: 'images/WhatsApp Image 2025-07-26 at 9.38.04 PM (1).jpeg',
                title: 'Senior KG',
                alt: 'Senior KG'
            },
            {
                src: 'images/WhatsApp Image 2025-07-26 at 9.38.05 PM.jpeg',
                title: 'Junior KG',
                alt: 'Junior KG'
            },
            {
                src: 'images/WhatsApp Image 2025-07-26 at 9.38.06 PM.jpeg',
                title: 'Children Playing',
                alt: 'Children Playing'
            },
            {
                src: 'images/WhatsApp Image 2025-07-26 at 9.38.06 PM (1).jpeg',
                title: 'Art Class',
                alt: 'Art Class'
            },
            {
                src: 'images/WhatsApp Image 2025-07-26 at 9.33.36 PM.jpeg',
                title: 'Outdoor Activities',
                alt: 'Outdoor Activities'
            }
        ];
        
        // Add IDs to default images
        const galleryImages = defaultImages.map(img => ({
            ...img,
            id: 'default-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
        }));
        
        // Save to localStorage
        localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
        localStorage.setItem('galleryInitialized', 'true');
        
        console.log('Gallery initialized with', galleryImages.length, 'default images');
    }
}); 
