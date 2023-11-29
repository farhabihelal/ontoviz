import sys
import os

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
        graph.node(
            id=node["id"],
            name=node_name,
            shape="ellipse",
            penwidth="2",
        )

    def create_graph_edge(self, graph: Digraph, edge: dict):
        graph.edge(
            self.process_label(edge["source"]["label"]),
            self.process_label(edge["target"]["label"]),
            label=edge["label"],
            penwidth="1.3",
        )

    def get_element_type(self, graph_element: dict) -> str:
        node_keys = ["id", "label", "type"]
        edge_keys = ["id", "label", "source", "target"]
        return (
            "node"
            if graph_element.keys() == node_keys
            else "edge"
            if graph_element.keys() == edge_keys
            else ""
        )

    def process_label(self, raw_label: str) -> str:
        return f'"{raw_label}"'
        # return url_parse.quote(html.escape(raw_label))

    def process_uri(self, uri: str) -> str:
        ns, display_name = uri.split("#")
        return display_name.strip()


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

    graph_data = {
        "nodes": {
            "n1": {"id": "n1", "label": "Individual 1", "type": "individual"},
            "n2": {"id": "n2", "label": "Individual 2", "type": "individual"},
            "n3": {"id": "n3", "label": "Individual 3", "type": "individual"},
            "n4": {"id": "n4", "label": "100", "type": "data_property"},
            "n5": {"id": "n5", "label": "Hello", "type": "data_property"},
            "n6": {"id": "n6", "label": "Object", "type": "class"},
        },
        "edges": {
            "e1": {
                "id": "e1",
                "source": {"id": "n1", "label": "Individual 1", "type": "individual"},
                "target": {"id": "n6", "label": "Object", "type": "class"},
                "label": "isA",
            },
            "e2": {
                "id": "e2",
                "source": {"id": "n1", "label": "Individual 1", "type": "individual"},
                "target": {"id": "n4", "label": "100", "type": "data_property"},
                "label": "hasMoney",
            },
            "e3": {
                "id": "e3",
                "source": {"id": "n2", "label": "Individual 2", "type": "individual"},
                "target": {"id": "n6", "label": "Object", "type": "class"},
                "label": "isA",
            },
            "e4": {
                "id": "e3",
                "source": {"id": "n3", "label": "Individual 3", "type": "individual"},
                "target": {"id": "n6", "label": "Object", "type": "class"},
                "label": "isA",
            },
            "e5": {
                "id": "e3",
                "source": {"id": "n2", "label": "Individual 2", "type": "individual"},
                "target": {"id": "n5", "label": "Hello", "type": "data_property"},
                "label": "says",
            },
        },
    }

    config = {
        "icons_path": f"{base_dir}/icons",
        "render_path": f"{base_dir}/renders",
        "style_data": style_data,
    }

    viz = Visualizer(config)
    viz.create_graph(graph_data)
