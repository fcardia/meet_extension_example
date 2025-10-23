import asyncio
import websockets
from io import BytesIO
from vosk import Model, KaldiRecognizer
from pydub import AudioSegment
import json

model = Model("vosk-model-small-en-us-0.15")
recognizer = KaldiRecognizer(model, 16000)

import numpy as np

def float32_to_pcm16(float_bytes):
    float_data = isinstance(float_bytes, dtype=np.float16)
    float_data = np.clip(float_data, -1.0, 1.0)
    pcm16 = (float_data * 32767).astype(np.int16)
    return pcm16.tobytes()


async def handle_audio(websocket):
    buffer = BytesIO()
    try:
        async for message in websocket:
            if isinstance(message, bytes):
                print(f"📦 Ricevuti {len(message)} byte (binario)")

                if recognizer.AcceptWaveform(message):
                    result = json.loads(recognizer.Result())
                    print("Final:", result)
                else:
                    partial = json.loads(recognizer.PartialResult())
                    print("Partial:", partial['partial'])

                await websocket.send("Trascrizione parziale simulata")
            else:
                print("📝 Messaggio di testo ricevuto:", message)
                if message == "STOP":
                    await websocket.send("OK, chiudo")
                    break
                else:
                    await websocket.send(f"Ricevuto testo: {message}")

    except websockets.ConnectionClosed as e:
        print("❌ Connessione chiusa:", e)
    except Exception as e:
        print("⚠️ Errore:", e)
    finally:
        try:
            await websocket.close()
        except:
            pass
        print("🔚 Handler terminato")

async def main():
    # ascolta su tutte le interfacce, porta 8000
    async with websockets.serve(handle_audio, "0.0.0.0", 8000):
        print("🚀 WebSocket server in ascolto su ws://0.0.0.0:8000/ws")
        await asyncio.Future()  # rimani in esecuzione

if __name__ == "__main__":
    asyncio.run(main())