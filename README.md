# Ngakak - Bill Splitting Made Easy

Ngakak (Ngebagi, Gampang, Asyik, Kompak, Aman, Keren) is a smart bill splitting application that uses AI to analyze bill images and automatically calculate individual shares based on what each person ordered.

## Features

- Upload bill images for analysis
- Intelligent bill parsing using OpenAI's GPT-4 Vision
- Automatic calculation of:
  - Individual item costs
  - VAT shares
  - Service charges
  - Discounts
  - Final totals per person
- Support for multiple currencies
- Interactive UI with detailed breakdowns
- Automatic handling of shared costs and proportional discounts

## Prerequisites

- Python 3.8 or higher
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ngakak.git
cd ngakak
```

2. Install the required dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the project root and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

## Usage

1. Run the Streamlit application:
```bash
streamlit run app.py
```

2. Upload a bill image using the file uploader

3. Provide a description of who ordered what in the text area

4. Click "Process Bill" to analyze and get the breakdown

5. View the detailed breakdown of costs per person

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)

## Notes

- The application handles VAT calculations (default 11% for Rupiah)
- Service charges and other fees are divided equally
- Discounts are distributed proportionally based on individual order amounts
- Crossed-out text in bills is not considered as discounts

## License

This project is licensed under the MIT License - see the LICENSE file for details. 