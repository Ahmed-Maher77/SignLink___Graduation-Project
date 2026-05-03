import streamlit as st
from gtts import gTTS
from io import BytesIO

def text_to_speech(message, lang):
    tts = gTTS(text=message, lang=lang)
    audio_buffer = BytesIO()
    tts.write_to_fp(audio_buffer)
    audio_buffer.seek(0)
    return audio_buffer

def main():
    st.title("Text to Speech Converter")
    message = st.text_area("Enter the text you want to convert to speech:", height=150)

    # Dropdown for language selection
    language = st.selectbox("Choose Language:", ("English", "Arabic"))
    lang_code = 'en' if language == 'English' else 'ar'

    if st.button("Convert to Speech"):
        if message:
            audio_file = text_to_speech(message, lang_code)
            audio_bytes = audio_file.read()
            st.audio(audio_bytes, format='audio/mp3')
        else:
            st.warning("Please enter some text to convert.")

if __name__ == "__main__":
    main()
