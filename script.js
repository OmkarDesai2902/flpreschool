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
    
    // Gallery Carousel
    const carouselContainer = document.querySelector('.carousel-container');
    const dotsContainer = document.querySelector('.carousel-dots');
    let currentSlide = 0;
    let isMobile = window.innerWidth <= 768;
    let autoRotateInterval;
    let slides = [];
    let dots = [];
    
    // Load gallery images from localStorage or use default ones
    // Make this function globally accessible
    window.loadGalleryImages = function() {
        if (carouselContainer && dotsContainer) {
            // Initialize gallery with default images if not already done
            initializeGalleryIfNeeded();
            
            const galleryImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
            
            // Clear existing slides
            carouselContainer.innerHTML = '';
            dotsContainer.innerHTML = '';
            
            if (galleryImages.length === 0) {
                console.warn('No gallery images found in localStorage');
                return;
            }
            
            // Create new slides from saved images
            galleryImages.forEach((image, index) => {
                // Create slide
                const slide = document.createElement('div');
                slide.className = 'carousel-slide';
                if (index === 0 && !isMobile) {
                    slide.classList.add('active');
                }
                
                // Create image
                const img = document.createElement('img');
                img.src = image.src;
                img.alt = image.alt || image.title;
                
                // Handle image loading errors
                img.onerror = function() {
                    console.error('Failed to load image:', image.src);
                    this.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                };
                
                // Append to carousel
                slide.appendChild(img);
                carouselContainer.appendChild(slide);
                
                // Create dot
                const dot = document.createElement('span');
                dot.className = 'dot';
                dot.setAttribute('data-slide', index);
                if (index === 0) {
                    dot.classList.add('active');
                }
                dotsContainer.appendChild(dot);
            });
            
            // Update slides and dots references
            slides = document.querySelectorAll('.carousel-slide');
            dots = document.querySelectorAll('.dot');
            
            // Add event listeners to dots
            dots.forEach((dot, index) => {
                dot.addEventListener('click', function() {
                    showSlide(index);
                });
            });
            
            console.log('Gallery loaded with', galleryImages.length, 'images');
        }
    }
    
    // Initialize gallery with default images if not already done
    // Make this function globally accessible
    window.initializeGalleryIfNeeded = function() {
        if (localStorage.getItem('galleryInitialized') !== 'true') {
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
    }
    
    // Call loadGalleryImages on page load
    loadGalleryImages();
    
    // Check for gallery updates from admin panel
    let lastGalleryUpdate = localStorage.getItem('galleryUpdated') || '0';
    
    // Check every 5 seconds if there are gallery updates from the admin panel
    setInterval(function() {
        const currentUpdate = localStorage.getItem('galleryUpdated') || '0';
        if (currentUpdate !== lastGalleryUpdate) {
            console.log('Gallery update detected, refreshing gallery');
            lastGalleryUpdate = currentUpdate;
            loadGalleryImages();
        }
    }, 5000);
    
    const prevSlideButton = document.getElementById('prev-slide');
    const nextSlideButton = document.getElementById('next-slide');
    slides = document.querySelectorAll('.carousel-slide');
    dots = document.querySelectorAll('.dot');
    
    if (slides.length > 0) {
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
                if (carouselContainer) {
                    carouselContainer.addEventListener('scroll', function() {
                        const scrollPosition = carouselContainer.scrollLeft;
                        const slideWidth = carouselContainer.offsetWidth;
                        const currentIndex = Math.round(scrollPosition / slideWidth);
                        
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
                if (!autoRotateInterval) {
                    autoRotateInterval = setInterval(function() {
                        if (!isMobile) {
                            currentSlide = (currentSlide + 1) % slides.length;
                            showSlide(currentSlide);
                        }
                    }, 5000);
                }
            }
        }
        
        // Function to show a specific slide (for desktop)
        function showSlide(index) {
            if (!isMobile) {
                slides.forEach(slide => slide.classList.remove('active'));
                dots.forEach(dot => dot.classList.remove('active'));
                
                slides[index].classList.add('active');
                dots[index].classList.add('active');
                currentSlide = index;
            } else {
                // For mobile, scroll to the slide
                if (carouselContainer) {
                    carouselContainer.scrollTo({
                        left: index * carouselContainer.offsetWidth,
                        behavior: 'smooth'
                    });
                }
            }
        }
        
        // Event listeners for navigation buttons (desktop only)
        if (prevSlideButton && nextSlideButton) {
            prevSlideButton.addEventListener('click', function() {
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                showSlide(currentSlide);
            });
            
            nextSlideButton.addEventListener('click', function() {
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            });
        }
        
        // Event listeners for dots (works on both mobile and desktop)
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                showSlide(index);
            });
        });
        
        // Initial setup
        checkDevice();
        
        // Update on window resize
        window.addEventListener('resize', checkDevice);
    }
    
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
            const whatsappNumber = "+917798894404";
            
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
