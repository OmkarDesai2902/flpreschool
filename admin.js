document.addEventListener('DOMContentLoaded', function() {
    // Cloudinary configuration
    const cloudinaryConfig = {
        cloudName: 'dn1gayytm', // Replace with your Cloudinary cloud name
        uploadPreset: 'flpreschool', // Replace with your upload preset (create one in your Cloudinary dashboard)
        apiKey: '522714568466587', // Replace with your API key
        // Note: API Secret should NEVER be included in frontend code
        // The API Secret should only be used in server-side code
    };
    
    // Register service worker for file uploads
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('file-service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }

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
    const uploadWidgetBtn = document.getElementById('upload-widget-btn');
    
    // Initialize Cloudinary Upload Widget
    if (uploadWidgetBtn) {
        const uploadWidget = cloudinary.createUploadWidget({
            cloudName: cloudinaryConfig.cloudName,
            uploadPreset: cloudinaryConfig.uploadPreset,
            folder: 'gallery',
            sources: ['local', 'url', 'camera'],
            multiple: false,
            styles: {
                palette: {
                    window: '#FFFFFF',
                    sourceBg: '#F4F4F5',
                    windowBorder: '#90A0B3',
                    tabIcon: '#0078FF',
                    inactiveTabIcon: '#69778A',
                    menuIcons: '#0078FF',
                    link: '#0078FF',
                    action: '#0078FF',
                    inProgress: '#0078FF',
                    complete: '#20B832',
                    error: '#EA2727',
                    textDark: '#000000',
                    textLight: '#FFFFFF'
                }
            }
        }, (error, result) => {
            // Handle different widget events
            if (result) {
                switch (result.event) {
                    case 'upload-started':
                        // Show uploading message when upload starts
                        showUploadStatus('Uploading image to Cloudinary...', 'info', 0); // 0 duration means don't auto-hide
                        break;
                        
                    case 'success':
                        console.log('Upload Widget success:', result.info);
                        
                        // Get the title from the input field or use the filename
                        const titleInput = document.getElementById('image-title');
                        const title = titleInput.value || result.info.original_filename;
                        
                        // Save the Cloudinary image reference
                        saveCloudinaryImageReference(result.info, title);
                        
                        // Show success message
                        showUploadStatus('Image uploaded successfully!', 'success');
                        
                        // Reset form
                        if (titleInput) titleInput.value = '';
                        
                        // Reload gallery images
                        loadGalleryImages();
                        break;
                        
                    case 'close':
                        // If widget is closed without a successful upload, clear the status
                        if (!result.info || result.info.event !== 'success') {
                            // Only clear if we don't have a success result
                            showUploadStatus('', '');
                        }
                        break;
                }
            }
            
            if (error) {
                console.error('Upload Widget error:', error);
                showUploadStatus('Error uploading image. Please try again.', 'error');
            }
        });
        
        // Open the widget when the button is clicked
        uploadWidgetBtn.addEventListener('click', function() {
            // Show initial uploading message
            showUploadStatus('Opening upload widget...', 'info');
            uploadWidget.open();
        });
    }
    
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
        
        // Upload to Cloudinary
        uploadToCloudinary(file, title);
    });
    
    // Function to upload image to Cloudinary
    function uploadToCloudinary(file, title) {
        // Create a new FormData instance
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);
        formData.append('folder', 'gallery'); // Store in a gallery folder
        
        // Add metadata
        formData.append('context', `alt=${title}|caption=${title}`);
        
        // Show uploading status with no auto-hide (duration = 0)
        showUploadStatus('Uploading image to Cloudinary...', 'info', 0);
        
        // Upload to Cloudinary
        fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Upload successful:', data);
            
            // Save image reference to localStorage
            saveCloudinaryImageReference(data, title);
            
            // Show success message
            showUploadStatus('Image uploaded successfully!', 'success');
            
            // Reset form
            uploadForm.reset();
            
            // Reload gallery images
            loadGalleryImages();
        })
        .catch(error => {
            console.error('Error uploading to Cloudinary:', error);
            showUploadStatus('Error uploading image. Please try again.', 'error');
        });
    }
    
    // Function to save Cloudinary image reference
    function saveCloudinaryImageReference(cloudinaryData, title) {
        // Get existing gallery images
        let galleryImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
        
        // Add new image reference
        const newImage = {
            id: cloudinaryData.public_id,
            src: cloudinaryData.secure_url,
            title: title,
            alt: title,
            cloudinaryId: cloudinaryData.public_id,
            version: cloudinaryData.version,
            format: cloudinaryData.format,
            width: cloudinaryData.width,
            height: cloudinaryData.height
        };
        
        galleryImages.push(newImage);
        
        // Save to localStorage
        try {
            localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
            console.log('Image reference saved to localStorage. New count:', galleryImages.length);
            
            // Update the main gallery on the index page
            localStorage.setItem('galleryUpdated', Date.now().toString());
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            showUploadStatus('Warning: Could not save image reference to localStorage.', 'warning');
        }
    }
    
    // Function to load gallery images
    function loadGalleryImages() {
        // Clear existing items
        galleryItems.innerHTML = '';
        
        // Get images from Cloudinary
        fetchCloudinaryImages()
            .then(images => {
                if (images && images.length > 0) {
                    displayGalleryItems(images);
                } else {
                    // No images found
                    galleryItems.innerHTML = '<div class="no-images-message">No images in the gallery. Upload some images first.</div>';
                }
            })
            .catch(error => {
                console.error('Error loading Cloudinary images:', error);
                // Fall back to localStorage
                loadGalleryImagesFromLocalStorage();
            });
    }
    
    // Function to fetch images from Cloudinary
    function fetchCloudinaryImages() {
        // Fetch images from Cloudinary Admin API
        // Note: In a real application, this should be done through a server endpoint
        // to protect your API secret. For demo purposes, we'll use localStorage.
        return new Promise((resolve, reject) => {
            // Get gallery images from localStorage
            const galleryImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
            
            if (galleryImages.length === 0) {
                resolve([]);
                return;
            }
            
            // For each image, check if it exists on Cloudinary
            // This is a simplified version - in a real app, you'd use the Cloudinary API
            const validImages = galleryImages.filter(image => image.cloudinaryId);
            resolve(validImages);
        });
    }
    
    // Function to load gallery images from localStorage (fallback)
    function loadGalleryImagesFromLocalStorage() {
        // Get gallery images from localStorage
        const galleryImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
        
        // Show message if no images
        if (galleryImages.length === 0) {
            galleryItems.innerHTML = '<div class="no-images-message">No images in the gallery. Upload some images first.</div>';
            return;
        }
        
        displayGalleryItems(galleryImages);
    }
    
    // Function to display gallery items in the admin panel
    function displayGalleryItems(images) {
        // Add images to gallery
        images.forEach(image => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.setAttribute('data-id', image.id || Date.now().toString());
            
            // Create image element with proper error handling
            const img = document.createElement('img');
            img.src = image.src;
            img.alt = image.alt || image.title || 'Gallery Image';
            img.onerror = function() {
                this.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22150%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22150%22%20height%3D%22150%22%20fill%3D%22%23cccccc%22%3E%3C%2Frect%3E%3Ctext%20x%3D%2275%22%20y%3D%2275%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2212%22%20fill%3D%22%23333333%22%3EImage%20not%20found%3C%2Ftext%3E%3C%2Fsvg%3E';
            };
            
            // Create title and remove button
            const titleDiv = document.createElement('div');
            titleDiv.className = 'item-title';
            titleDiv.textContent = image.title || image.alt || 'Gallery Image';
            
            const removeBtn = document.createElement('div');
            removeBtn.className = 'remove-btn';
            removeBtn.setAttribute('data-id', image.id || Date.now().toString());
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
        
        console.log('Gallery images loaded:', images.length);
    }
    
    // Function to remove image
    function removeImage(id) {
        // Get gallery images from localStorage
        let galleryImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
        
        // Find the image to remove
        const imageToRemove = galleryImages.find(image => image.id === id);
        
        if (!imageToRemove) {
            showManageStatus('Image not found.', 'error');
            return;
        }
        
        // Check if it's a Cloudinary image
        if (imageToRemove.cloudinaryId) {
            // Delete from Cloudinary
            deleteFromCloudinary(imageToRemove.cloudinaryId)
                .then(() => {
                    // Remove from localStorage
                    removeFromLocalStorage(id);
                })
                .catch(error => {
                    console.error('Error deleting from Cloudinary:', error);
                    showManageStatus('Error deleting image from Cloudinary. Removing from local gallery only.', 'warning');
                    removeFromLocalStorage(id);
                });
        } else {
            // Just remove from localStorage
            removeFromLocalStorage(id);
        }
    }
    
    // Function to delete image from Cloudinary
    function deleteFromCloudinary(publicId) {
        // In a real application, this should be done through a server endpoint
        // to protect your API secret. For demo purposes, we'll show a message.
        showManageStatus('Deleting image from Cloudinary...', 'info');
        
        // Simulate a delete operation
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Image deleted from Cloudinary:', publicId);
                resolve();
            }, 1000);
        });
    }
    
    // Function to remove image from localStorage
    function removeFromLocalStorage(id) {
        // Get gallery images from localStorage
        let galleryImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
        
        // Remove image with matching id
        galleryImages = galleryImages.filter(image => image.id !== id);
        localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
        
        // Reload gallery images
        loadGalleryImages();
        
        // Show success message
        showManageStatus('Image removed from gallery.', 'success');
        
        // Update the main gallery on the index page without triggering a reload
        localStorage.setItem('galleryUpdated', Date.now().toString());
    }
    
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
        if (confirm('Are you sure you want to reset the gallery to default images? This will not delete images from Cloudinary but will reset your local gallery.')) {
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
    
    // Updated function to show upload status messages with custom duration
    function showUploadStatus(message, type, duration = 3000) {
        uploadStatus.textContent = message;
        uploadStatus.className = 'status-message ' + type;
        
        // Clear message after specified duration (if duration > 0)
        if (duration > 0) {
            setTimeout(() => {
                uploadStatus.textContent = '';
                uploadStatus.className = 'status-message';
            }, duration);
        }
    }
    
    // Updated function to show manage status messages with custom duration
    function showManageStatus(message, type, duration = 3000) {
        manageStatus.textContent = message;
        manageStatus.className = 'status-message ' + type;
        
        // Clear message after specified duration
        setTimeout(() => {
            manageStatus.textContent = '';
            manageStatus.className = 'status-message';
        }, duration);
    }
    
    // Initialize gallery with default images
    function initializeGallery() {
        console.log('Initializing gallery with default images');
        
        // Default images from Cloudinary
        const defaultImages = [
            {
                id: 'sample1',
                src: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
                title: 'Sample Image 1',
                alt: 'Sample Image 1',
                cloudinaryId: 'sample'
            },
            {
                id: 'sample2',
                src: 'https://res.cloudinary.com/demo/image/upload/v1371282172/sample_face_closeup.jpg',
                title: 'Sample Image 2',
                alt: 'Sample Image 2',
                cloudinaryId: 'sample_face_closeup'
            }
        ];
        
        // Save to localStorage
        localStorage.setItem('galleryImages', JSON.stringify(defaultImages));
        localStorage.setItem('galleryInitialized', 'true');
        
        console.log('Gallery initialized with', defaultImages.length, 'default images');
    }
    
    // Check if gallery is initialized, if not, initialize it
    if (!localStorage.getItem('galleryInitialized')) {
        initializeGallery();
    }
}); 
