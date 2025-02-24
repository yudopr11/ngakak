import streamlit as st
from dotenv import load_dotenv
import io, base64, json
from PIL import Image
from openai import OpenAI
import pandas as pd


# Load environment variables
load_dotenv()

def bytesio_to_base64(image_bytesio):
    """Convert BytesIO image to Base64 string."""
    image_bytesio.seek(0)  # Ensure the pointer is at the start
    encoded_string = base64.b64encode(image_bytesio.read()).decode("utf-8")
    return encoded_string

def analyze_bill(image_url, description):
    client = OpenAI()
    prompt = f'''
    Based on the bill image, here's the description of who ordered what: 
    
    {description}

    Please analyze the bill and create a detailed breakdown of what each person needs to pay based on their individual orders, including all individual items and their prices. Additionally, include any shared costs such as vat, and other fees or shared discounts. The following conditions must be met:
    - Detect and include the currency used in the bill.
    - Vat is calculated proportionally based on the total order amount of each person and its currency. If not stated, Rupiah has 11% vat.
    - Service charges and other fees are divided equally among all persons.
    - If a discount does not have an associated discount rate (e.g., a shipping discount), distribute its total amount evenly among all individuals.
    - If a discount has an associated rate (e.g., 20% discount), first note the total discount amount provided. Then, allocate this discount proportionally based on each individuals bill relative to the total bill for all individuals.
    - Subtract this discount share from their original order amount.
    - **Important: The crossed out text is not a discount, it is just a marketing technique, so do not consider it as a discount in your calculations.**

    Format the output as valid JSON with the following structure:
    
    {{
    "split_details": {{
        "person_name": {{
        "items": [
            {{"item": "item_name", "price": decimal}}
        ],
        "individual_total": decimal,
        "vat_share": decimal,
        "other_share": decimal,
        "discount_share": decimal,
        "final_total": decimal
        }}
    }},
    "total_bill": decimal,
    "total_vat": decimal,
    "total_other": decimal,
    "total_discount": decimal,
    "currency": "currency_symbol_or_code"
    }}

    The output must be just valid JSON with no additional text or explanations.
    '''
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            temperature=0,
            messages=[{
                "role": "system",
                "content": "You are a helpful assistant that analyzes bills and splits the bill according to the description of who ordered what."
                },
                {
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
        st.metric("Total Vat", f"{currency}{analysis['total_vat']}")
    with col3:
        st.metric("Total Other", f"{currency}{analysis['total_other']}")    
    with col4:
        st.metric("Total Discount", f"{currency}{analysis['total_discount']}")

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
                st.write("Vat Share")
                st.write(f"{currency}{details['vat_share']}")
            with col3:
                st.write("Other Share")
                st.write(f"{currency}{details['other_share']}")
            with col4:
                st.write("Discount Share")
                st.write(f"{currency}{details['discount_share']}")
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
        "Describe order details",
        placeholder="Example: John ordered one pasta and a soda. Sarah had the steak and wine. They agreed to split the service charge equally. The bill is in Rupiah. The tax is 11%. Total bill is 200000 excluding tax.",
        key="description",
        height=200
    )

    if uploaded_file is not None:
        # Read and display the image
        bytes_data = uploaded_file.getvalue()
        image_bytes = io.BytesIO(bytes_data)
        base64_string = bytesio_to_base64(image_bytes)
        image = Image.open(image_bytes)
        st.image(image, caption='Uploaded Bill', use_container_width=True)

        # Button to process the bill; only clickable once
        st.button('Process Bill', on_click=click_button, disabled=st.session_state.button_clicked, use_container_width=True)

        if st.session_state.button_clicked and description and not st.session_state.processed:
            with st.spinner('Uploading image and analyzing bill...'):
                try:
                    # Upload image
                    image_url = f"data:image/jpeg;base64,{base64_string}"
                    
                    # Analyze the bill via OpenAI
                    analysis = analyze_bill(image_url, description)
                    
                    if analysis:
                        display_bill_breakdown(analysis)
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
