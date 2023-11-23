function generateUUID() {
  const array = new Uint32Array(4);
  window.crypto.getRandomValues(array);
  return array.join("-");
}

function createNode(label, style) {
  return {
    data: {
      id: generateUUID(),
      label: label,
    },
    classes: style,
  };
}
function createEdge(source, target, label) {
  return {
    data: {
      id: generateUUID(),
      source: source.data.id,
      target: target.data.id,
      label: label,
    },
  };
}

function getDisplayNameFromIRI(iri) {
  let displayName = "";

  let split = iri.split("#");

  if (split.length == 1) {
    displayName = split[0];
  } else if (split.length == 2) {
    displayName = split[1];
  }

  return displayName;
}

function createGraph(nodes, edges, styles) {
  container = document.getElementById("cy");

  elements = [];

  Object.keys(nodes).forEach((key) => {
    elements.push(nodes[key]);
  });

  Object.keys(edges).forEach((key) => {
    elements.push(edges[key]);
  });

  console.log(elements);

  style = [
    {
      selector: ".individual-node",
      style: {
        width: 80,
        height: 80,
        "background-color": "dark-grey",
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        "text-margin-y": "0px",
        "text-background-color": "#fff",
        "text-background-opacity": 0.0,
        "text-background-padding": "3px",
        shape: "circle",
      },
    },
    {
      selector: ".type-node",
      style: {
        width: 80,
        height: 80,
        "background-color": "dark-grey",
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        "text-margin-y": "0px",
        "text-background-color": "#fff",
        "text-background-opacity": 0.0,
        "text-background-padding": "3px",
        shape: "circle",
      },
    },
    {
      selector: ".property-node",
      style: {
        width: 80,
        height: 80,
        "background-color": "dark-grey",
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        "text-margin-y": "0px",
        "text-background-color": "#fff",
        "text-background-opacity": 0.0,
        "text-background-padding": "3px",
        shape: "circle",
      },
    },
    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "#ccc",
        "target-arrow-color": "#ccc",
        "target-arrow-shape": "triangle",
        label: "data(label)", // Set label on the edge
        "text-background-color": "#fff",
        "text-background-opacity": 0.7,
        "text-background-padding": "3px",
      },
    },
  ];
  layout = {
    name: "grid",
  };

  var cy = cytoscape({
    container: container,
    elements: elements,
    style: style,
    layout: layout,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  data = {
    individuals: [
      {
        uri: "http://ontology.com#Person-Farhabi",
        types: ["http://ontology.com#Person"],
        data_properties: {
          "http://ontology.com#hasId": "0",
          "http://ontology.com#hasName": "Farhabi",
          "http://ontology.com#hasAge": "30",
        },
        object_properties: [],
      },
      {
        uri: "http://ontology.com#Person-Randy",
        types: ["http://ontology.com#Person"],
        data_properties: {
          "http://ontology.com#hasId": "1",
          "http://ontology.com#hasName": "Randy",
          "http://ontology.com#hasAge": "50",
        },
        object_properties: [],
      },
    ],
  };

  let processedData = processRawData(data);
  createGraph(processedData.nodes, processedData.edges, processedData.styles);
});

function getData(server_uri) {
  fetch(`https://${server_uri}/kb/list`, {
    method: "GET",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query_type: "300",
    }),
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Request failed with status: " + response.status);
      }

      return response.json();
    })
    .then(processRawData)
    .catch(function (error) {
      console.error("Fetch error:", error);
    });
}

function processRawData(rawData) {
  let allNodes = {};
  let allEdges = [];

  let individuals = rawData["individuals"];

  for (let i = 0; i < individuals.length; i++) {
    let individual = individuals[i];
    let uri = individual["uri"];

    let individualNode = createNode(
      getDisplayNameFromIRI(uri),
      "individual-node"
    );
    allNodes[uri] = individualNode;

    let types = individual["types"];
    types.forEach((iri) => {
      if (!(iri in allNodes)) {
        let displayName = getDisplayNameFromIRI(iri);
        let node = createNode(displayName, "type-node");
        let edge = createEdge(individualNode, node, displayName);

        allNodes[iri] = node;
        allEdges.push(edge);
      }
    });

    let dataProperties = individual["data_properties"];
    Object.keys(dataProperties).forEach((iri) => {
      let value = dataProperties[iri];
      if (!(iri in allNodes)) {
        let displayName = getDisplayNameFromIRI(iri);
        let node = createNode(displayName, "property-node");
        let edge = createEdge(individualNode, node, displayName);

        allNodes[iri] = node;
        allEdges.push(edge);
      }
    });

    let objectProperties = individual["object_properties"];
  }

  return { nodes: allNodes, edges: allEdges, styles: [] };
}

function updateLoop() {
  // data = getData();
  // processedData = processRawData(data);
  // createGraph(processedData.nodes, processedData.edges, processedData.styles);
}

var intervalDuration = 2000;
var intervalId = setInterval(updateLoop, intervalDuration);
