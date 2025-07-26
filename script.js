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
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const prevSlideButton = document.getElementById('prev-slide');
    const nextSlideButton = document.getElementById('next-slide');
    const carouselContainer = document.querySelector('.carousel-container');
    let currentSlide = 0;
    let isMobile = window.innerWidth <= 768;
    let autoRotateInterval;
    
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
