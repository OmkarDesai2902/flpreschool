/**
 * File Service Worker
 * Handles file uploads in a JavaScript-only environment
 */

// Service worker scope
self.addEventListener('install', event => {
  self.skipWaiting();
  console.log('File Service Worker installed');
});

self.addEventListener('activate', event => {
  console.log('File Service Worker activated');
  return self.clients.claim();
});

// Intercept fetch requests
self.addEventListener('fetch', event => {
  // Only handle POST requests to save-file.php
  if (event.request.method === 'POST' && event.request.url.includes('save-file.php')) {
    event.respondWith(handleFileUpload(event.request));
  }
});

/**
 * Handle file upload requests
 * @param {Request} request - The fetch request
 * @returns {Promise<Response>} - The response
 */
async function handleFileUpload(request) {
  try {
    // Clone the request to read its body
    const requestClone = request.clone();
    
    // Get the form data from the request
    const formData = await requestClone.formData();
    const file = formData.get('file');
    const destination = formData.get('destination') || 'uploads/';
    
    if (!file) {
      return createErrorResponse('No file found in request');
    }
    
    // In a real service worker, we would save the file to the cache or IndexedDB
    // But since we can't actually write to the file system from a browser,
    // we'll create a download link for the user
    
    // Create a unique file ID
    const fileId = Date.now().toString();
    
    // Store file in cache
    const cache = await caches.open('gallery-files');
    const fileResponse = new Response(file);
    await cache.put(`/gallery-files/${fileId}`, fileResponse);
    
    // Send message to client to handle the file
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'file-upload',
        fileId: fileId,
        fileName: file.name,
        destination: destination
      });
    });
    
    // Return success response
    return new Response(JSON.stringify({
      success: true,
      message: 'File processed successfully',
      fileId: fileId,
      fileName: file.name
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    return createErrorResponse('Error processing file: ' + error.message);
  }
}

/**
 * Create an error response
 * @param {string} message - Error message
 * @returns {Response} - Error response
 */
function createErrorResponse(message) {
  return new Response(JSON.stringify({
    success: false,
    message: message
  }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
} 
