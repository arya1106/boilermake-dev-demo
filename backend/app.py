from flask import Flask, request
import whisper

app = Flask(__name__)
model = whisper.load_model("tiny.en")

@app.route("/createTranscription")
def createTranscription():

app.run(debug=True)