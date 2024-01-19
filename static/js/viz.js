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
        width: 70,
        height: 70,
        "background-color": "blue",
        label: "data(label)",
        "text-valign": "bottom",
        "text-halign": "center",
        "text-margin-y": "10px",
        "text-background-color": "#fff",
        "text-background-opacity": 0.0,
        "text-background-padding": "3px",
        shape: "circle",
      },
    },
    {
      selector: ".type-node",
      style: {
        width: 50,
        height: 50,
        "background-color": "green",
        label: "data(label)",
        "text-valign": "bottom",
        "text-halign": "center",
        "text-margin-y": "10px",
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
    // name: "cose",
    // name: "circle",
    // name: "random",
    name: "breadthfirst",
    // name: "concentric",
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
          "http://ontology.com#hasId": [
            '"0"^^http://www.w3.org/2001/XMLSchema#integer',
          ],
          "http://ontology.com#hasName": [
            '"Farhabi"^^http://www.w3.org/2001/XMLSchema#string',
          ],
          "http://ontology.com#hasAge": [
            '"30"^^http://www.w3.org/2001/XMLSchema#integer',
          ],
        },
        object_properties: {
          "http://ontology.com#hasSupervisor": [
            "http://ontology.com#Person-Randy",
          ],
        },
      },
      {
        uri: "http://ontology.com#Person-Randy",
        types: ["http://ontology.com#Person"],
        data_properties: {
          "http://ontology.com#hasId": [
            '"1"^^http://www.w3.org/2001/XMLSchema#integer',
          ],
          "http://ontology.com#hasName": [
            '"Randy"^^http://www.w3.org/2001/XMLSchema#string',
          ],
          "http://ontology.com#hasAge": [
            '"50"^^http://www.w3.org/2001/XMLSchema#integer',
          ],
        },
        object_properties: {},
      },
    ],
  };

  let processedData = processRawData(data);
  createGraph(processedData.nodes, processedData.edges, processedData.styles);
});

function getData(server_uri) {
  return fetch(`${server_uri}/kb/list`, {
    method: "POST",
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
    .catch(function (error) {
      console.error("Fetch error:", error);
    });
}

function processRawData(rawData) {
  let typeNodes = {};
  let individualNodes = {};

  let allNodes = [];
  let allEdges = [];

  const individuals = rawData["individuals"];

  // Create all the individual nodes first
  individuals.forEach((individual) => {
    const uri = individual["uri"];

    // Skip if not an IRI
    if (!isIRI(uri)) {
      return;
    }

    const individualNode = individualNodes.hasOwnProperty(uri)
      ? individualNodes[uri]
      : createNode(getDisplayNameFromIRI(uri), "individual-node");
    individualNodes[uri] = individualNode;
    allNodes.push(individualNode);
  });

  // Handle all individual nodes
  individuals.forEach((individual) => {
    const uri = individual["uri"];
    const individualNode = individualNodes[uri];

    const types = individual["types"];
    types.forEach((iri) => {
      // Skip if not an IRI
      if (!isIRI(iri)) {
        return;
      }
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
      for (let i = 0; i < dataProperties[iri].length; i++) {
        const displayName = getDisplayNameFromIRI(iri);
        const rawValue = dataProperties[iri][i];
        const { value, type } = parseDataProperty(rawValue);
        console.log(`${displayName} : ${value}`);
        const node = createNode(value, "property-node");
        const edge = createEdge(individualNode, node, displayName);

        allNodes.push(node);
        allEdges.push(edge);
      }
    });

    let objectProperties = individual["object_properties"];
    Object.keys(objectProperties).forEach((iri) => {
      for (let i = 0; i < objectProperties[iri].length; i++) {
        const value = objectProperties[iri][i];
        const displayName = getDisplayNameFromIRI(iri);
        console.log(`${displayName} : ${value}`);
        const objectNode = individualNodes.hasOwnProperty(value)
          ? individualNodes[value]
          : createNode(value, "individual-node");
        const edge = createEdge(individualNode, objectNode, displayName);

        allEdges.push(edge);
      }
    });
  });

  return { nodes: allNodes, edges: allEdges, styles: [] };
}

async function getHash(inputString) {
  const encoder = new TextEncoder();
  const data = encoder.encode(inputString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert the hashBuffer to a hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

async function updateLoop() {
  let rawData = await getData(queryServerUri);
  console.log(`rawData: ${rawData}`);

  if (
    rawData != null &&
    getHash(JSON.stringify(rawData)) != getHash(JSON.stringify(lastRawData))
  ) {
    console.log("Data has changed!");
    updateGraph(rawData);
  }
}

function updateGraph(rawData) {
  let processedData = processRawData(rawData);
  console.log(`processedData: ${processedData}`);
  createGraph(processedData.nodes, processedData.edges, processedData.styles);
  lastRawData = rawData;
}
