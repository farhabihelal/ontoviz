import sys
import os

import requests


class OntoViz:
    def __init__(self, config: dict) -> None:
        pass

    def configure(self, config: dict) -> None:
        self.query_server_uri = config["query_server_uri"]

    def fetch_data(self, url: str) -> dict:
        url = url or f"{self.query_server_uri}/kb/list"

        response = requests.get(url)
        if response.status_code != 200:
            print(f"Error fetching data: {response.status_code}")
            raise IOError("Failed to fetch data.")

        return response.json()

    def generate_graph(self, raw_data: dict):
        pass

    def render(self, data: dict):
        pass


if __name__ == "__main__":
    config = {
        "query_server_uri": "http://localhost:8880",
    }

    viz = OntoViz(config)
