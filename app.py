import sys
import os
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "src")))


from ontoviz.ontoviz import OntoViz


from flask import Flask, render_template

app = Flask(__name__)


ontoviz_config = {
    "query_server_uri": "http://localhost:8880",
    "icons_path": "",
    "render_path": "",
    "style_data": None,
    "refresh_rate_hz": 5,
}
ontoviz = OntoViz(ontoviz_config)


@app.route("/")
def root():
    # ontoviz.generate_graph()
    # return render_template("index-flask.html")
    return render_template("index-cy.html")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
