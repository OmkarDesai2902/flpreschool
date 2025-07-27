document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (nav.classList.contains('active') && !event.target.closest('nav') && !event.target.closest('.menu-toggle')) {
            nav.classList.remove('active');
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
            }
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Dynamic Gallery Carousel
    const dynamicCarousel = document.getElementById('dynamic-carousel');
    const carouselDots = document.getElementById('carousel-dots');
    const prevSlideButton = document.getElementById('prev-slide');
    const nextSlideButton = document.getElementById('next-slide');
    let currentSlide = 0;
    let slides = [];
    let autoRotateInterval;
    let isMobile = window.innerWidth <= 768;
    
    // Function to load gallery images
    function loadGalleryImages() {
        if (dynamicCarousel) {
            // Clear any existing content
            dynamicCarousel.innerHTML = '';
            
            // Get gallery images from localStorage (these are Cloudinary references)
            const galleryImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
            
            if (galleryImages && galleryImages.length > 0) {
                // Process the Cloudinary images
                processGalleryImages(galleryImages);
            } else {
                console.error('No gallery images found');
                // Show a message in the gallery if no images are found
                dynamicCarousel.innerHTML = '<div class="no-images-message">No gallery images found</div>';
                
                // Hide carousel controls if there are no images
                const carouselControls = document.querySelector('.carousel-controls');
                if (carouselControls) {
                    carouselControls.style.display = 'none';
                }
            }
        }
    }
    
    // Function to optimize Cloudinary images for the carousel
    function getOptimizedCloudinaryUrl(imageUrl, width = 1200, height = 800, quality = 'auto') {
        // Check if it's a Cloudinary URL
        if (imageUrl.includes('cloudinary.com')) {
            // Parse the URL to extract components
            try {
                const urlParts = imageUrl.split('/upload/');
                if (urlParts.length === 2) {
                    // Insert transformation parameters
                    return `${urlParts[0]}/upload/w_${width},h_${height},c_fill,q_${quality}/${urlParts[1]}`;
                }
            } catch (error) {
                console.error('Error optimizing Cloudinary URL:', error);
            }
        }
        
        // Return original URL if not a Cloudinary URL or if parsing fails
        return imageUrl;
    }
    
    // Function to process gallery images and create carousel
    function processGalleryImages(galleryImages) {
        if (!galleryImages || galleryImages.length === 0) {
            console.error('No gallery images found');
            dynamicCarousel.innerHTML = '<div class="no-images-message">No gallery images found</div>';
            
            // Hide carousel controls if there are no images
            const carouselControls = document.querySelector('.carousel-controls');
            if (carouselControls) {
                carouselControls.style.display = 'none';
            }
            return;
        }
        
        // Show carousel controls
        const carouselControls = document.querySelector('.carousel-controls');
        if (carouselControls) {
            carouselControls.style.display = 'flex';
        }
        
        // Create slides for each image
        galleryImages.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            if (index === 0 && !isMobile) {
                slide.classList.add('active');
            }
            
            const img = document.createElement('img');
            // Use optimized Cloudinary URL if available
            img.src = getOptimizedCloudinaryUrl(image.src);
            img.alt = image.alt || image.title || 'Gallery Image';
            
            // Add error handling for images
            img.onerror = function() {
                this.onerror = null;
                // Use a data URI for the placeholder image instead of an external file
                this.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%23cccccc%22%3E%3C%2Frect%3E%3Ctext%20x%3D%22150%22%20y%3D%22100%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%23333333%22%3EImage%20not%20found%3C%2Ftext%3E%3C%2Fsvg%3E';
                this.alt = 'Image not found';
            };
            
            // Add loading attribute for better performance
            img.loading = 'lazy';
            
            slide.appendChild(img);
            dynamicCarousel.appendChild(slide);
        });
        
        // Create dots for each slide
        if (carouselDots) {
            carouselDots.innerHTML = '';
            
            galleryImages.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.className = 'dot';
                if (index === 0) {
                    dot.classList.add('active');
                }
                dot.setAttribute('data-slide', index);
                
                dot.addEventListener('click', function() {
                    showSlide(index);
                });
                
                carouselDots.appendChild(dot);
            });
        }
        
        // Get all slides after they've been created
        slides = document.querySelectorAll('.carousel-slide');
        
        // Initialize the carousel
        initCarousel();
    }
    
    // Function to initialize carousel
    function initCarousel() {
        // Check if mobile or desktop
        function checkDevice() {
            isMobile = window.innerWidth <= 768;
            if (isMobile) {
                // Mobile setup
                slides.forEach(slide => {
                    slide.classList.remove('active');
                    slide.style.opacity = '1';
                });
                if (autoRotateInterval) {
                    clearInterval(autoRotateInterval);
                }
                
                // Update dots based on scroll position
                if (dynamicCarousel) {
                    dynamicCarousel.addEventListener('scroll', function() {
                        const scrollPosition = dynamicCarousel.scrollLeft;
                        const slideWidth = dynamicCarousel.offsetWidth;
                        const currentIndex = Math.round(scrollPosition / slideWidth);
                        
                        const dots = document.querySelectorAll('.dot');
                        dots.forEach((dot, index) => {
                            dot.classList.toggle('active', index === currentIndex);
                        });
                    });
                }
            } else {
                // Desktop setup
                slides.forEach((slide, index) => {
                    if (index === currentSlide) {
                        slide.classList.add('active');
                    } else {
                        slide.classList.remove('active');
                    }
                });
                
                // Start auto-rotation for desktop
                startAutoRotation();
            }
        }
        
        // Function to show a specific slide
        function showSlide(index) {
            if (!slides || slides.length === 0) return;
            
            // Make sure index is within bounds
            index = Math.max(0, Math.min(index, slides.length - 1));
            
            if (!isMobile) {
                slides.forEach(slide => slide.classList.remove('active'));
                const dots = document.querySelectorAll('.dot');
                dots.forEach(dot => dot.classList.remove('active'));
                
                slides[index].classList.add('active');
                if (dots[index]) dots[index].classList.add('active');
                currentSlide = index;
            } else {
                // For mobile, scroll to the slide
                if (dynamicCarousel) {
                    dynamicCarousel.scrollTo({
                        left: index * dynamicCarousel.offsetWidth,
                        behavior: 'smooth'
                    });
                }
            }
        }
        
        // Function to start auto-rotation
        function startAutoRotation() {
            if (autoRotateInterval) {
                clearInterval(autoRotateInterval);
            }
            
            if (slides.length <= 1) return; // Don't rotate if there's only one slide
            
            autoRotateInterval = setInterval(function() {
                if (!isMobile) {
                    currentSlide = (currentSlide + 1) % slides.length;
                    showSlide(currentSlide);
                }
            }, 5000);
        }
        
        // Event listeners for navigation buttons
        if (prevSlideButton && nextSlideButton) {
            prevSlideButton.addEventListener('click', function() {
                if (!slides || slides.length === 0) return;
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                showSlide(currentSlide);
            });
            
            nextSlideButton.addEventListener('click', function() {
                if (!slides || slides.length === 0) return;
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            });
        }
        
        // Initial setup
        checkDevice();
        
        // Update on window resize
        window.addEventListener('resize', checkDevice);
    }
    
    // Listen for gallery updates from localStorage
    window.addEventListener('storage', function(event) {
        if (event.key === 'galleryUpdated') {
            console.log('Gallery updated in another tab, refreshing...');
            loadGalleryImages();
        }
    });
    
    // Load gallery images when the page loads
    loadGalleryImages();
    
    // Testimonial Slider
    const testimonials = document.querySelectorAll('.testimonial');
    const prevButton = document.getElementById('prev-testimonial');
    const nextButton = document.getElementById('next-testimonial');
    let currentTestimonial = 0;
    
    if (testimonials.length > 0) {
        // Hide all testimonials except the first one
        testimonials.forEach((testimonial, index) => {
            if (index !== 0) {
                testimonial.style.display = 'none';
            }
        });
        
        // Function to show a specific testimonial
        function showTestimonial(index) {
            testimonials.forEach(testimonial => {
                testimonial.style.display = 'none';
            });
            testimonials[index].style.display = 'block';
        }
        
        // Event listeners for navigation buttons
        if (prevButton && nextButton) {
            prevButton.addEventListener('click', function() {
                currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
                showTestimonial(currentTestimonial);
            });
            
            nextButton.addEventListener('click', function() {
                currentTestimonial = (currentTestimonial + 1) % testimonials.length;
                showTestimonial(currentTestimonial);
            });
            
            // Auto-rotate testimonials every 5 seconds
            setInterval(function() {
                currentTestimonial = (currentTestimonial + 1) % testimonials.length;
                showTestimonial(currentTestimonial);
            }, 5000);
        }
    }
    
    // Form submission handling
    const enrollmentForm = document.getElementById('enrollment-form');
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (enrollmentForm) {
        enrollmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const parentName = document.getElementById('parent-name').value;
            const childName = document.getElementById('child-name').value;
            const childAge = document.getElementById('child-age').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;
            
            // Create WhatsApp message
            const whatsappNumber = "+917350170520";
            
            // Get the program from the select element
            const childAgeSelect = document.getElementById('child-age');
            const selectedOption = childAgeSelect.options[childAgeSelect.selectedIndex];
            const selectedText = selectedOption.text;
            
            // Extract program name from the selected text (e.g., "2.5-3.5 years (Nursery)")
            const programMatch = selectedText.match(/\((.*?)\)/);
            const program = programMatch ? programMatch[1] : "Nursery/KG";
            
            let whatsappMessage = `Hello, I'm ${parentName}, parent of ${childName}.\n\n`;
            whatsappMessage += `I'm interested in enrolling my child in the ${program} program.\n\n`;
            whatsappMessage += `Contact Details:\n`;
            whatsappMessage += `Email: ${email}\n`;
            whatsappMessage += `Phone: ${phone}\n\n`;
            
            if (message) {
                whatsappMessage += `Additional Message: ${message}\n\n`;
            }
            
            whatsappMessage += "Please contact me regarding admission. Thank you!";
            
            // Encode the message for URL
            const encodedMessage = encodeURIComponent(whatsappMessage);
            
            // Create WhatsApp URL
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            
            // Open WhatsApp in a new tab
            window.open(whatsappURL, '_blank');
            
            // Reset the form
            enrollmentForm.reset();
        });
    }
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real application, you would send this data to a server
            // For this demo, we'll just show an alert
            alert('Thank you for subscribing to our newsletter!');
            newsletterForm.reset();
        });
    }
    
    // Animate elements when they come into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.program-card, .gallery-item, .value');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Set initial styles for animation
    document.querySelectorAll('.program-card, .gallery-item, .value').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // Run animation check on load and scroll
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);
}); 
