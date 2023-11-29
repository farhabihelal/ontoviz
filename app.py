import sys
import os
import json

from ontoviz.ontoviz import OntoViz


from flask import Flask, render_template

app = Flask(__name__)


ontoviz_config = {}
ontoviz = OntoViz(ontoviz_config)


@app.route("/")
def root():
    ontoviz.generate_graph()
    return render_template("index-flask.html")


if __name__ == "__main__":
    app.run(debug=True)
