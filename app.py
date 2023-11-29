import sys
import os
import json


from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def ontoviz():
    return render_template("index-flask.html")


if __name__ == "__main__":
    app.run(debug=True)
