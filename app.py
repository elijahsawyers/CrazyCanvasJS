from flask import Flask, render_template, request, url_for, redirect
from werkzeug.utils import secure_filename
app = Flask(__name__)

@app.route("/")
def hello_world():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def uploadPDF():
    file = request.files["PDFFile"]
    file.save("static/pdfs/" + secure_filename(file.filename))
    return redirect(url_for("/"))