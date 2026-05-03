from fastapi import FastAPI, Form
from fastapi.responses import StreamingResponse, JSONResponse
from gtts import gTTS
from io import BytesIO

app = FastAPI()

@app.post("/text-to-speech/")
async def tts_api(text: str = Form(...), language: str = Form("en")):
    if not text.strip():
        return JSONResponse(status_code=400, content={"error": "Text cannot be empty."})
    
    try:
        tts = gTTS(text=text, lang=language)
        audio_buffer = BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        return StreamingResponse(audio_buffer, media_type="audio/mpeg")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
