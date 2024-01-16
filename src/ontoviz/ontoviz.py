import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

import requests
from uuid import uuid4
from time import time, sleep

from visualizer import Visualizer


class OntoViz:
    def __init__(self, config: dict) -> None:
        self.configure(config)

        self.visualizer = Visualizer(config)

    def configure(self, config: dict) -> None:
        self.config = config
        self.query_server_uri = config["query_server_uri"]
        self.refresh_rate_hz = config["refresh_rate_hz"]

    def fetch_data(self, url: str = None) -> dict:
        url = url or f"{self.query_server_uri}/kb/list"

        response = requests.get(url)
        if response.status_code != 200:
            print(f"Error fetching data: {response.status_code}")
            raise IOError("Failed to fetch data.")

        return response.json()

    def get_node(self, label: str, node_type: str) -> dict:
        return {
            "id": uuid4().hex,
            "label": label,
            "type": node_type,
        }

    def get_edge(self, source: dict, target: dict, label: str = "") -> dict:
        return {
            "id": uuid4().hex,
            "source": source,
            "target": target,
            "label": label,
        }

    def process_data(self, raw_data: dict) -> dict:
        nodes = {}
        edges = {}

        raw_individuals = raw_data["individuals"]
        for raw_individual in raw_individuals:
            raw_individual: dict
            uri: str = raw_individual["uri"]
            type_uris: list = raw_individual["types"]
            raw_data_properties: dict = raw_individual["data_properties"]
            raw_object_properties: dict = raw_individual["object_properties"]

            individual_node: dict = self.get_node(label=uri, node_type="individual")
            nodes[individual_node["id"]] = individual_node

            # Types
            for type_uri in type_uris:
                type_uri: str
                type_node = self.get_node(label=type_uri, node_type="class")
                nodes[type_node["id"]] = type_node
                edge = self.get_edge(individual_node, type_node, "isA")
                edges[edge["id"]] = edge

            # Data Properties
            for prop_iri, value in raw_data_properties.items():
                prop_iri: str
                value: str
                data_prop_node = self.get_node(label=value, node_type="data_property")
                nodes[data_prop_node["id"]] = data_prop_node
                edge = self.get_edge(
                    source=individual_node, target=data_prop_node, label=prop_iri
                )
                edges[edge["id"]] = edge

            # Object Properties
            for prop_iri, object_uris in raw_object_properties.items():
                prop_iri: str
                object_uris: list
                for object_uri in object_uris:
                    object_uri: str
                    object_node: dict = (
                        nodes.get(object_uri)
                        if object_uri in nodes
                        else self.get_node(label=object_uri, node_type="individual")
                    )
                    nodes[object_node["id"]] = object_node
                    edge = self.get_edge(
                        source=individual_node, target=object_node, label=prop_iri
                    )
                    edges[edge["id"]] = edge

        return {
            "nodes": nodes,
            "edges": edges,
        }

    def generate_graph(self, raw_data: dict = None) -> None:
        raw_data = raw_data or self.fetch_data()
        graph_data = self.process_data(raw_data)
        self.visualizer.create_graph(graph_data)

    def run(self, url: str = None):
        sleep_duration_sec = 1 / self.refresh_rate_hz
        while True:
            self.generate_graph()
            sleep(sleep_duration_sec)


if __name__ == "__main__":
    raw_data = {
        "individuals": [
            {
                "uri": "http://ontology.com#Person-Farhabi",
                "types": [
                    "http://ontology.com#Person",
                ],
                "data_properties": {
                    "http://ontology.com#hasId": "0",
                    "http://ontology.com#hasName": "Farhabi",
                    "http://ontology.com#hasAge": "30",
                },
                "object_properties": {},
            },
            {
                "uri": "http://ontology.com#Person-Randy",
                "types": [
                    "http://ontology.com#Person",
                ],
                "data_properties": {
                    "http://ontology.com#hasId": "1",
                    "http://ontology.com#hasName": "Randy",
                    "http://ontology.com#hasAge": "30",
                },
                "object_properties": {},
            },
        ],
    }

    style_data = {
        "class_type": {
            "intent-name": {
                "color": "orangered1",
                "font-size": "20",
                "font": "Calibri",
            },
            "action": {
                "color": "darkseagreen4",
                "font-size": "16",
                "font": "Calibri",
            },
            "messages": {
                "color": "burlywood1",
                "font-size": "18",
                "font": "Calibri",
            },
        },
        "individual": {
            "intent-name": {
                "color": "orangered1",
                "font-size": "20",
                "font": "Calibri",
            },
            "action": {
                "color": "darkseagreen4",
                "font-size": "16",
                "font": "Calibri",
            },
            "messages": {
                "color": "burlywood1",
                "font-size": "18",
                "font": "Calibri",
            },
        },
        "data_property": {
            "intent-name": {
                "color": "orangered1",
                "font-size": "20",
                "font": "Calibri",
            },
            "action": {
                "color": "darkseagreen4",
                "font-size": "16",
                "font": "Calibri",
            },
            "messages": {
                "color": "burlywood1",
                "font-size": "18",
                "font": "Calibri",
            },
        },
        "edge": {
            "direct": {
                "color": "black",
                "arrowsize": "2.0",
                "penwidth": "3.0",
                "style": "",
            },
            "indirect": {
                "color": "firebrick2",
                "arrowsize": "2.0",
                "penwidth": "3.0",
                "style": "",
            },
        },
    }

    base_dir = os.path.abspath(f"{os.path.dirname(__file__)}/../../")
    config = {
        "query_server_uri": "http://localhost:8880",
        "icons_path": f"{base_dir}/icons",
        "render_path": f"{base_dir}/renders",
        "style_data": style_data,
        "refresh_rate_hz": 5,
    }

    viz = OntoViz(config)
    viz.run()
