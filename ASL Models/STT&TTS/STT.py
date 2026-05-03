import streamlit as st
import speech_recognition as sr
import os
from pydub import AudioSegment

def save_uploadedfile(uploadedfile):
    os.makedirs("tempDir", exist_ok=True)  # Ensure the directory exists
    file_path = os.path.join("tempDir", uploadedfile.name)
    with open(file_path, "wb") as f:
        f.write(uploadedfile.getbuffer())
    return file_path

def main():
    st.title("Speech to Text Converter")
    st.write("Upload an audio file (WAV format) and convert it to text.")
    
    # Language selection
    language_option = st.selectbox("Select Language for Recognition:", ['English', 'Arabic'])
    language_code = 'en-US' if language_option == 'English' else 'ar-SA'

    uploaded_file = st.file_uploader("Choose an audio file...", type=['wav'])
    if uploaded_file is not None:
        file_path = save_uploadedfile(uploaded_file)
        st.audio(file_path)

        # Speech recognition
        recognizer = sr.Recognizer()
        with sr.AudioFile(file_path) as source:
            audio_data = recognizer.record(source)
            try:
                # using the default API key, to use another API key use r.recognize_google(audio, key="GOOGLE_SPEECH_RECOGNITION_API_KEY")
                text = recognizer.recognize_google(audio_data, language=language_code)
                st.write("Recognized Text:")
                st.text_area(label="", value=text, height=150)
            except sr.UnknownValueError:
                st.error("Google Speech Recognition could not understand audio")
            except sr.RequestError as e:
                st.error(f"Could not request results from Google Speech Recognition service; {e}")

if __name__ == '__main__':
    main()