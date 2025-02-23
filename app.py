import streamlit as st
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv
import os
from PIL import Image
import io
from openai import OpenAI
import pandas as pd
import json

# Load environment variables
load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

def delete_image(public_id):
    try:
        result = cloudinary.uploader.destroy(public_id)
    except Exception as e:
        st.error(f'An error occurred while deleting: {str(e)}')

def analyze_bill(image_url, description):
    client = OpenAI()
    prompt = f'''
    This is a restaurant bill image. Here's the description of who ordered what: 
    
    {description}

    Please analyze the bill and create a detailed breakdown of what each person needs to pay based on their individual orders, including all individual items and their prices. Additionally, include any shared costs such as tax, service, tip, and other fees. The following conditions must be met:
    - Tax is calculated proportionally based on the total order amount of each person.
    - Service charges and tip are divided equally among all persons.
    - Detect and include the currency used in the bill.

    Format the output as valid JSON with the following structure:
    
    {{
    "split_details": {{
        "person_name": {{
        "items": [
            {{"item": "item_name", "price": integer}}
        ],
        "individual_total": integer,
        "tax_share": integer,
        "service_share": integer,
        "tip_share": integer,
        "final_total": integer
        }}
    }},
    "total_bill": integer,
    "total_tax": integer,
    "total_service": integer,
    "total_tip": integer,
    "currency": "currency_symbol_or_code"
    }}

    Ensure that all numbers are formatted to 2 decimal places. The output must be just valid JSON with no additional text or explanations.
    '''
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            temperature=0,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_url}}
                ]
            }],
            max_tokens=1000
        )
        # Clean the response and convert to JSON
        return json.loads(response.choices[0].message.content.replace("```json", "").replace("```", "").strip())
    
    except Exception as e:
        st.error(f'An error occurred: {str(e)}')

def display_bill_breakdown(analysis):
    if not analysis:
        return

    # Get currency from analysis
    currency = analysis.get('currency', '$')

    st.subheader("Bill Summary")
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Bill", f"{currency}{analysis['total_bill']}")
    with col2:
        st.metric("Total Tax", f"{currency}{analysis['total_tax']}")
    with col3:
        st.metric("Total Tip", f"{currency}{analysis['total_tip']}")
    with col4:
        st.metric("Total Service", f"{currency}{analysis['total_service']}")

    st.subheader("Individual Breakdowns")
    for person, details in analysis['split_details'].items():
        with st.expander(f"{person} - Total: {currency}{details['final_total']}"):
            if details['items']:
                items_df = pd.DataFrame(details['items'])
                if 'price' in items_df.columns:
                    items_df['price'] = items_df['price'].apply(lambda x: f"{currency}{x}")
                st.dataframe(items_df, hide_index=True, use_container_width=True)
            
            col1, col2, col3, col4, col5 = st.columns(5)
            with col1:
                st.write("Items Total")
                st.write(f"{currency}{details['individual_total']}")
            with col2:
                st.write("Tax Share")
                st.write(f"{currency}{details['tax_share']}")
            with col3:
                st.write("Tip Share")
                st.write(f"{currency}{details['tip_share']}")
            with col4:
                st.write("Service Share")
                st.write(f"{currency}{details['service_share']}")
            with col5:
                st.write("Final Total")
                st.write(f"{currency}{details['final_total']}")

def reset_all():
    """Reset all session state variables and force a rerun of the app."""
    keys_to_reset = ['processed', 'button_clicked', 'uploaded_file', 'description']
    for key in keys_to_reset:
        if key in st.session_state:
            del st.session_state[key]
    st.rerun()

def main():
    # Configure the page
    st.set_page_config(
        page_title="Ngakak",
        page_icon="💰",
    )

    st.title("Ngakak")
    st.write("Ngebagi, Gampang, Asyik, Kompak, Aman, Keren")

    # Initialize session state if not already present
    if 'processed' not in st.session_state:
        st.session_state.processed = False
    if 'button_clicked' not in st.session_state:
        st.session_state.button_clicked = False

    def click_button():
        st.session_state.button_clicked = True

    # File uploader using a session state key for consistency
    uploaded_file = st.file_uploader("Upload your bill image", type=['png', 'jpg', 'jpeg'], key="uploaded_file")
    
    # Text area for description with a session state key
    description = st.text_area(
        "Describe who ordered what",
        placeholder="Example: John ordered one pasta and a soda. Sarah had the steak and wine. They agreed to split the service charge equally.",
        key="description"
    )

    if uploaded_file is not None:
        # Read and display the image
        bytes_data = uploaded_file.getvalue()
        image_bytes = io.BytesIO(bytes_data)
        image = Image.open(image_bytes)
        st.image(image, caption='Uploaded Bill', use_container_width=True)

        # Button to process the bill; only clickable once
        st.button('Process Bill', on_click=click_button, disabled=st.session_state.button_clicked, use_container_width=True)

        if st.session_state.button_clicked and description and not st.session_state.processed:
            with st.spinner('Uploading image and analyzing bill...'):
                try:
                    # Upload image to Cloudinary
                    upload_result = cloudinary.uploader.upload(io.BytesIO(bytes_data), folder="bill")
                    image_url = upload_result['secure_url']
                    public_id = upload_result['public_id']

                    # Analyze the bill via OpenAI
                    analysis = analyze_bill(image_url, description)
                    if analysis:
                        display_bill_breakdown(analysis)
                        delete_image(public_id)
                        st.session_state.processed = True
                except Exception as e:
                    st.error(f'An error occurred: {str(e)}')
                    st.session_state.button_clicked = False  # Reset button state on error
        
        # Button to reset the app after processing
        if st.session_state.processed:
            if st.button('Process Another Bill', use_container_width=True):
                reset_all()

if __name__ == '__main__':
    main()
