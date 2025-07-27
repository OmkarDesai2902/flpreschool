# Cloudinary Setup Guide

This guide will help you set up Cloudinary for your dynamic gallery.

## Step 1: Create a Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com/) and sign up for a free account if you don't have one already.
2. After signing up, you'll be taken to your dashboard.

## Step 2: Get Your API Credentials

1. In your Cloudinary dashboard, look for the "Account Details" section.
2. You'll find your:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## Step 3: Create an Upload Preset

An upload preset allows you to upload directly from the browser without exposing your API secret.

1. In your Cloudinary dashboard, go to **Settings** > **Upload** tab.
2. Scroll down to **Upload presets** and click **Add upload preset**.
3. Give it a name (e.g., "gallery_uploads").
4. Set **Signing Mode** to **Unsigned** for browser uploads.
5. Under **Folder**, enter "gallery" to keep your uploads organized.
6. Configure any other settings as needed (optional):
   - Enable auto-tagging
   - Set image optimization options
   - Add any default transformations
7. Click **Save** to create the preset.

## Step 4: Update Your Website Configuration

1. Open the `admin.js` file in your website code.
2. Find the `cloudinaryConfig` object at the top of the file:
   ```javascript
   const cloudinaryConfig = {
       cloudName: 'YOUR_CLOUD_NAME', // Replace with your Cloudinary cloud name
       uploadPreset: 'YOUR_UPLOAD_PRESET', // Replace with your upload preset
       apiKey: 'YOUR_API_KEY', // Replace with your API key
   };
   ```
3. Replace the placeholder values with your actual credentials:
   - `YOUR_CLOUD_NAME` with your Cloudinary cloud name
   - `YOUR_UPLOAD_PRESET` with the name of the upload preset you created
   - `YOUR_API_KEY` with your Cloudinary API key

## Step 5: Test Your Configuration

1. Open your website and log in to the admin panel (password: 9876).
2. Go to the "Upload Images" tab.
3. Try uploading an image using the "Select & Upload Image" button.
4. If successful, the image will appear in your gallery.

## Important Security Notes

- **NEVER** include your API Secret in your frontend code. It should only be used in server-side code.
- The upload preset should be set to "unsigned" for browser uploads.
- Consider setting up upload restrictions in your Cloudinary settings to prevent abuse.

## Advanced Configuration (Optional)

- **Transformations**: You can add default transformations to your upload preset to automatically resize, crop, or optimize images.
- **Folders**: You can change the folder structure by modifying the `folder` parameter in both the upload widget and the upload preset.
- **Moderation**: Enable automatic content moderation in your upload preset settings to filter inappropriate content.

## Troubleshooting

- If uploads fail, check your browser console for error messages.
- Verify that your cloud name, API key, and upload preset are correct.
- Make sure your upload preset is set to "unsigned" for browser uploads.
- Check if you've reached your Cloudinary plan limits. 
