# Streamlit Image Upload to Cloudinary

This is a simple Streamlit application that allows users to upload images to Cloudinary.

## Setup

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Configure your Cloudinary credentials:
   - Rename `.env.example` to `.env`
   - Update the following variables in `.env` with your Cloudinary credentials:
     - CLOUDINARY_CLOUD_NAME
     - CLOUDINARY_API_KEY
     - CLOUDINARY_API_SECRET

   You can get these credentials from your Cloudinary dashboard.

## Running the Application

To run the application, use the following command:
```bash
streamlit run app.py
```

## Features

- Upload images (PNG, JPG, JPEG)
- Preview uploaded images before sending to Cloudinary
- Display upload status and results
- Show image details after successful upload
- Error handling for failed uploads

## Note

Make sure you have a Cloudinary account and valid credentials before using this application. You can sign up for free at [Cloudinary](https://cloudinary.com/). 