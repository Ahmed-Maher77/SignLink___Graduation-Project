from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import speech_recognition as sr
from pydub import AudioSegment
import tempfile

app = FastAPI()

@app.post("/speech-to-text/")
async def speech_to_text(audio: UploadFile = File(...), language: str = Form("en-US")):
    # Save uploaded audio temporarily
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmpfile:
        tmpfile.write(await audio.read())
        tmpfile_path = tmpfile.name

    # Recognize speech
    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(tmpfile_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language=language)
        return JSONResponse(content={"text": text}, status_code=200)
    except sr.UnknownValueError:
        return JSONResponse(content={"error": "Could not understand audio"}, status_code=400)
    except sr.RequestError as e:
        return JSONResponse(content={"error": f"API error: {e}"}, status_code=503)
