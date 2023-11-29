import sys
import os

from uuid import uuid4
import html
import urllib.parse as url_parse

from graphviz import Digraph


class Visualizer:
    def __init__(self, config: dict) -> None:
        self.configure(config)

    def configure(self, config: dict):
        self.config = config

        self.icons_path = config["icons_path"]
        self.render_path = config["render_path"]
        self.style_data = config["style_data"]

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

    def create_graph(self, graph_data: dict, **kwargs) -> Digraph:
        """ """
        graph = self.get_graph(
            name=f"ontoviz",
            # directory=os.path.join("", "DOT"),
            filename=f".gv",
            format="png",
        )

        nodes: dict = graph_data["nodes"]
        edges: dict = graph_data["edges"]

        for node_id, node in nodes.items():
            node_id: str
            node: dict
            self.create_graph_node(graph, node)

        for edge_id, edge in edges.items():
            edge_id: str
            edge: dict
            self.create_graph_edge(graph, edge)

        graph.render(
            # filename=f"{intent.display_name}.gv",
            # directory=f"{os.path.abspath(self.config['render_path'])}/{datetime.now().strftime('%Y-%m-%d-%H:%M')}",
            view=False,
            # format="pdf",
            # renderer="cairo",
            # engine="neato",
            # formatter="cairo",
            outfile=os.path.join(f"ontoviz.png"),
            overwrite_source=True,
        )

        return graph

    def get_graph(
        self, name=None, directory=None, filename=None, format=None
    ) -> Digraph:
        """ """
        graph = Digraph(
            name=name,
            directory=directory,
            filename=filename,
            edge_attr={},
            node_attr={
                "shape": "plaintext",
            },
            format=format,
            engine="dot",
            formatter="cairo",
            renderer="cairo",
            graph_attr={"ratio": "1"},
        )
        return graph

    def create_graph_node(self, graph: Digraph, node: dict):
        node_name = self.process_label(node["label"])
        graph.node(node_name, shape="ellipse")

    def create_graph_edge(self, graph: Digraph, edge: dict):
        graph.edge(
            self.process_label(edge["source"]["label"]),
            self.process_label(edge["target"]["label"]),
            label=edge["label"],
        )

    def process_label(self, raw_label: str) -> str:
        return url_parse.quote(html.escape(raw_label))


if __name__ == "__main__":
    base_dir = os.path.abspath(f"{os.path.dirname(__file__)}/../../")

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
                    "http://ontology.com#hasAge": "50",
                },
                "object_properties": {},
            },
        ],
    }

    config = {
        "icons_path": f"{base_dir}/icons",
        "render_path": f"{base_dir}/renders",
        "style_data": style_data,
    }

    viz = Visualizer(config)
    data = viz.process_data(raw_data)
    viz.create_graph(data)
