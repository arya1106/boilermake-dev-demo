from flask import Flask
app = Flask(__name__)

@app.route("/createTranscription")
def index():
    

app.run(debug=True)