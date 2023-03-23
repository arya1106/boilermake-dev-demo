from crypt import methods
import datetime
import json
import os
from flask import Flask, request
from flask_cors import CORS
import whisper
from werkzeug.utils import secure_filename
import psycopg2
import hashlib
from dotenv import load_dotenv


load_dotenv()
app = Flask(__name__)
CORS(app)
model = whisper.load_model("tiny.en")

@app.route("/createTranscription", methods=["POST"])
def createTranscription():
    conn = psycopg2.connect(os.environ.get("CONNECTION_STRING"))
    metadata = request.form.to_dict()
    print(metadata)
    audio_file = request.files.get("audioFile")
    filename = secure_filename(audio_file.filename)
    audio_file.save(filename)
    audio_file.close()
    with open(filename, 'rb') as audio_file_local:
        file_hash = hashlib.md5(audio_file_local.read()).hexdigest()
    with conn.cursor() as cur:
        cur.execute(f"SELECT 1 FROM audio_transcriptions WHERE audio_hash = %s;", (file_hash,))
        if(cur.fetchone() == None):
            text = model.transcribe(filename)["text"]
            sql = f"INSERT INTO audio_transcriptions VALUES (%s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326), CURRENT_TIMESTAMP, %s, %s, %s);"
            cur.execute(sql, (file_hash, text.strip(), metadata['lng'], metadata['lat'], metadata['recorder'], metadata['title'], audio_file.filename))
            conn.commit()
            cur.execute("SELECT transcript, ST_Y(location), ST_X(location), created_on, recorder, title, filename FROM audio_transcriptions WHERE audio_hash = %s;", (file_hash,))
            data = cur.fetchone()
            os.remove(filename)
            return json.dumps({
                "fileExistsInDB": False,
                "text": text,
                "lat": data[1],
                "long": data[2],
                "createdOn": data[3].replace(tzinfo=datetime.timezone.utc).isoformat(),
                "recorder": data[4],
                "title": data[5],
                "filename": data[6]
            })
        else:
            os.remove(filename)
            cur.execute("SELECT transcript, ST_Y(location), ST_X(location), created_on, recorder, title, filename FROM audio_transcriptions WHERE audio_hash = %s;", (file_hash,))
            data = cur.fetchone()
            return json.dumps({
                "fileExistsInDB": True,
                "text": data[0],
                "lat": data[1],
                "long": data[2],
                "createdOn": data[3].replace(tzinfo=datetime.timezone.utc).isoformat(),
                "recorder": data[4],
                "title": data[5],
                "filename": data[6]
            })
    
@app.route("/queryDatabase", methods=["POST"])
def queryDatabase():
    conn = psycopg2.connect(os.environ.get("CONNECTION_STRING"))
    file = request.files.get("audioFile")
    filename = secure_filename(file.filename)
    file.save(filename)
    file.close()
    with open(filename, 'rb') as audio_file_local:
        file_hash = hashlib.md5(audio_file_local.read()).hexdigest()
    with conn.cursor() as cur:
        cur.execute(f"SELECT 1 FROM audio_transcriptions WHERE audio_hash = %s;", (file_hash,))
        if(cur.fetchone() == None):
            os.remove(filename)
            return json.dumps({
                "fileExistsInDB": False
            })
        else:
            os.remove(filename)
            cur.execute("SELECT transcript, ST_Y(location), ST_X(location), created_on, recorder, title, filename FROM audio_transcriptions WHERE audio_hash = %s;", (file_hash,))
            data = cur.fetchone()
            return json.dumps({
                "fileExistsInDB": True,
                "text": data[0],
                "lat": data[1],
                "long": data[2],
                "createdOn": data[3].replace(tzinfo=datetime.timezone.utc).isoformat(),
                "recorder": data[4],
                "title": data[5],
                "filename": data[6]
            })