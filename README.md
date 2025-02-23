# Ngakak - Split Bill App

Ngakak (Ngebagi, Gampang, Asyik, Kompak, Aman, Keren) is a smart bill splitting application that uses AI to analyze restaurant bills and provide detailed breakdowns of shared expenses.

## Features

- Upload bill images (PNG, JPG, JPEG)
- AI-powered bill analysis using OpenAI's GPT-4
- Automatic detection of items, prices, and currency
- Fair split calculation for:
  - Individual items
  - Tax (proportionally divided)
  - Service charges (equally divided)
  - Tips (equally divided)
- Clean and intuitive user interface
- Temporary cloud storage with automatic cleanup

## Setup

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Configure your environment variables:
   - Rename `.env.example` to `.env`
   - Update the following variables in `.env`:
     ```
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     OPENAI_API_KEY=your_openai_api_key
     ```

## Usage

1. Run the application:
```bash
streamlit run app.py
```

2. Upload a bill image
3. Describe who ordered what in the text area
   Example: "John ordered pasta (15.99) and soda (2.99). Sarah had steak (25.99) and wine (8.99). They agreed to split the service charge and tip equally."
4. Click "Process Bill" to get the breakdown
5. View the detailed split showing:
   - Total bill summary
   - Individual breakdowns
   - Item-wise details
   - Shared costs distribution

## Requirements

- Python 3.8+
- Streamlit
- OpenAI API access
- Cloudinary account
- Internet connection

## Note

Make sure you have valid API credentials for both OpenAI and Cloudinary before using the application. The app temporarily stores images in Cloudinary for AI processing and automatically deletes them afterward. 