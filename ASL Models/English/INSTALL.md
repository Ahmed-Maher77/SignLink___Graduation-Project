# Installation Instructions
This code was developed and tested using Python 3.10.12.
## Dependencies
To install the required dependencies, run the following commands while in the "English" Directory:
```bash
pip install -r requirements.txt
```

## Fix for torchvision Import Error

After installing the dependencies, you may need to fix a compatibility issue related to the torchvision package.
Run the following command to fix it:
```bash
python fix.py
```

## Grammar Correction

For grammar correction to work, you have to make an [OpenRouter](https://openrouter.ai/) account, create a free API key, create a .env file in English/utils and put your API key in there like this: 
```env
OPENROUTER_API_KEY = "YOUR_API_KEY"
```
Please note that free OpenRouter API keys allow up to only 50 requests per day. For higher usage limits, refer to their pricing page.