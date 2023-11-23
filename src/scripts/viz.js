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
        width: 50,
        height: 50,
        "background-color": "blue",
        label: "data(label)",
        "text-valign": "top",
        "text-halign": "center",
        "text-margin-y": "-5px",
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
        "background-color": "green",
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        "text-margin-y": "0px",
        "text-background-color": "#fff",
        "text-background-opacity": 0.0,
        "text-background-padding": "3px",
        shape: "rectangle",
      },
    },
    {
      selector: ".property-node",
      style: {
        width: 50,
        height: 50,
        "background-color": "red",
        label: "data(label)",
        "text-valign": "bottom",
        "text-halign": "center",
        "text-margin-y": "10px",
        "text-background-color": "#fff",
        "text-background-opacity": 0.0,
        "text-background-padding": "3px",
        shape: "triangle",
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
  let typeNodes = {};
  let individualNodes = {};
  let dataPropertyNodes = {};

  let allNodes = [];
  let allEdges = [];

  const individuals = rawData["individuals"];

  individuals.forEach((individual) => {
    const uri = individual["uri"];

    const individualNode = createNode(
      getDisplayNameFromIRI(uri),
      "individual-node"
    );
    individualNodes[uri] = individualNode;
    allNodes.push(individualNode);

    const types = individual["types"];
    types.forEach((iri) => {
      const displayName = getDisplayNameFromIRI(iri);

      const typeIndividualNodes = { ...typeNodes, ...individualNodes };
      const node = typeIndividualNodes.hasOwnProperty(iri)
        ? typeIndividualNodes[iri]
        : createNode(displayName, "type-node");

      console.log(
        `Creating edge between ${JSON.stringify(
          individualNode
        )} and ${JSON.stringify(node)}`
      );

      const edge = createEdge(individualNode, node, "isA");

      typeNodes[iri] = node;

      allNodes.push(node);
      allEdges.push(edge);
    });

    let dataProperties = individual["data_properties"];
    Object.keys(dataProperties).forEach((iri) => {
      const value = dataProperties[iri];
      const displayName = getDisplayNameFromIRI(iri);
      const node = createNode(value, "property-node");
      const edge = createEdge(individualNode, node, displayName);

      allNodes.push(node);
      allEdges.push(edge);
    });

    let objectProperties = individual["object_properties"];
  });

  return { nodes: allNodes, edges: allEdges, styles: [] };
}

function updateLoop() {
  // data = getData();
  // processedData = processRawData(data);
  // createGraph(processedData.nodes, processedData.edges, processedData.styles);
}

var intervalDuration = 2000;
var intervalId = setInterval(updateLoop, intervalDuration);
