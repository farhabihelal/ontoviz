var graph = null;
var enableTest = false;

function generateUUID() {
  const array = new Uint32Array(4);
  window.crypto.getRandomValues(array);
  return array.join("-");
}

function createNode(id, label, style) {
  return {
    data: {
      id: id,
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

function createGraph(nodes, edges) {
  container = document.getElementById("cy");

  elements = [];

  Object.keys(nodes).forEach((key) => {
    elements.push(nodes[key]);
  });

  Object.keys(edges).forEach((key) => {
    elements.push(edges[key]);
  });

  console.log(`elements : ${elements}`);

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
        "font-family": "Arial, sans-serif",
        "font-size": "24px",
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
        "font-family": "Arial, sans-serif",
        "font-size": "28px",
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
        "font-family": "Arial, sans-serif",
        "font-size": "24px",
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
        "curve-style": "bezier",
        label: "data(label)", // Set label on the edge
        "source-endpoint": "outside-to-line",
        "target-endpoint": "outside-to-line",
        "arrow-scale": 2,
        "text-background-color": "#fff",
        "text-background-opacity": 0.7,
        "text-background-padding": "3px",
        "font-family": "Arial, sans-serif",
        "font-size": "20px",
      },
    },
  ];
  layout = {
    // name: "grid",
    // name: "cose",
    // name: "circle",
    // name: "random",
    // name: "avsdf",
    // name: "dagre",
    // name: "elk",
    // name: "cola",
    name: "breadthfirst",
    // name: "concentric",
  };

  graph = cytoscape({
    container: container,
    elements: elements,
    style: style,
    layout: layout,
    // zoom: { duration: 1000, easing: "ease-in-out" },
    // pan: { duration: 1000 },
  });
}

function updateGraph(nodes, edges, styles) {
  elements = [];

  Object.keys(nodes).forEach((key) => {
    elements.push(nodes[key]);
  });

  Object.keys(edges).forEach((key) => {
    elements.push(edges[key]);
  });

  console.log(elements);

  graph.json({ elements: elements });
  graph.layout({ name: "breadthfirst" }).run();
}

function getTestData() {
  data = {
    individuals: [
      {
        uri: "http://www.hri-em.org/haru/kb/tof.owl#Farhabi",
        types: ["http://www.hri-em.org/haru/kb/tof.owl#Person"],
        data_properties: {
          "http://www.hri-em.org/haru/kb/tof.owl#hasId": [
            '"0"^^http://www.w3.org/2001/XMLSchema#integer',
          ],
          "http://www.hri-em.org/haru/kb/tof.owl#hasName": [
            '"Farhabi"^^http://www.w3.org/2001/XMLSchema#string',
          ],
          "http://www.hri-em.org/haru/kb/tof.owl#hasAge": [
            '"30"^^http://www.w3.org/2001/XMLSchema#integer',
          ],
        },
        object_properties: {
          "http://www.hri-em.org/haru/kb/tof.owl#hasSupervisor": [
            "http://www.hri-em.org/haru/kb/tof.owl#Randy",
          ],
        },
      },
      {
        uri: "http://www.hri-em.org/haru/kb/tof.owl#Randy",
        types: ["http://www.hri-em.org/haru/kb/tof.owl#Person"],
        data_properties: {
          "http://www.hri-em.org/haru/kb/tof.owl#hasId": [
            '"1"^^http://www.w3.org/2001/XMLSchema#integer',
          ],
          "http://www.hri-em.org/haru/kb/tof.owl#hasName": [
            '"Randy"^^http://www.w3.org/2001/XMLSchema#string',
          ],
          "http://www.hri-em.org/haru/kb/tof.owl#hasAge": [
            '"50"^^http://www.w3.org/2001/XMLSchema#integer',
          ],
        },
        object_properties: {},
      },
    ],
  };

  return data;
}

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
  // let typeNodes = {};
  let individualNodes = {};

  let allNodes = {};
  let allEdges = [];

  const individuals = rawData["individuals"];
  const filteredIndividuals = filterIndividuals(rawData);

  // Create all the individual nodes first
  filteredIndividuals.forEach((individual) => {
    const uri = individual["uri"];

    // Skip if not an IRI
    if (!isIRI(uri)) {
      return;
    }

    const individualNode = individualNodes.hasOwnProperty(uri)
      ? individualNodes[uri]
      : createNode(uri, getDisplayNameFromIRI(uri), "individual-node");
    individualNodes[uri] = individualNode;
    allNodes[uri] = individualNode;
  });

  // Handle all individual nodes
  filteredIndividuals.forEach((individual) => {
    const uri = individual["uri"];
    const individualNode = individualNodes[uri];

    const types = individual["types"];
    types.forEach((iri) => {
      // Skip if not an IRI
      if (!isIRI(iri)) {
        return;
      }
      const displayName = getDisplayNameFromIRI(iri);

      // const typeIndividualNodes = { ...typeNodes, ...individualNodes };
      const node = individualNodes.hasOwnProperty(iri)
        ? individualNodes[iri]
        : createNode(iri, displayName, "type-node");

      console.log(
        `Creating edge between ${JSON.stringify(
          individualNode
        )} and ${JSON.stringify(node)}`
      );

      const edge = createEdge(individualNode, node, "isA");

      // typeNodes[iri] = node;

      allNodes[iri] = node;
      allEdges.push(edge);
    });

    let dataProperties = individual["data_properties"];
    Object.keys(dataProperties).forEach((iri) => {
      for (let i = 0; i < dataProperties[iri].length; i++) {
        const displayName = getDisplayNameFromIRI(iri);
        const rawValue = dataProperties[iri][i];
        const { value, type } = parseDataProperty(rawValue);
        console.log(`${displayName} : ${value}`);
        const nodeId = `${uri}-${iri}-${value}`;
        const node = createNode(nodeId, value, "property-node");
        const edge = createEdge(individualNode, node, displayName);

        allNodes[nodeId] = node;
        allEdges.push(edge);
      }
    });

    let objectProperties = individual["object_properties"];
    Object.keys(objectProperties).forEach((iri) => {
      for (let i = 0; i < objectProperties[iri].length; i++) {
        const value = objectProperties[iri][i];
        const displayName = getDisplayNameFromIRI(iri);
        console.log(`${displayName} : ${value}`);
        const node = individualNodes.hasOwnProperty(value)
          ? individualNodes[value]
          : createNode(iri, value, "individual-node");
        const edge = createEdge(individualNode, node, displayName);

        allEdges.push(edge);
      }
    });
  });

  return { nodes: Object.values(allNodes), edges: allEdges, styles: [] };
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

async function run() {
  const queryServerUri = "http://localhost:8880";
  let rawData = enableTest ? getTestData() : await getData(queryServerUri);
  console.log(`rawData: ${rawData}`);
  update(rawData);
  // if (
  //   rawData != null &&
  //   getHash(JSON.stringify(rawData)) != getHash(JSON.stringify(lastRawData))
  // ) {
  //   console.log("Data has changed!");
  //   updateGraph(rawData);
  // }
}

function update(rawData) {
  const processedData = processRawData(rawData);
  console.log(`processedData: ${processedData}`);
  updateGraph(processedData.nodes, processedData.edges, processedData.styles);

  lastRawData = rawData;
}

function filterIndividuals(rawData) {
  const individuals = rawData["individuals"];

  filteredIndividuals = {};

  individuals.forEach((individual) => {
    const uri = individual["uri"];
    const types = individual["types"];
    const objectProperties = individual["object_properties"];

    types.forEach((typeIRI) => {
      if (typeIRI === "http://www.hri-em.org/haru/kb/tof.owl#Person") {
        filteredIndividuals[uri] = individual;

        function addObjectProperties(objectProperties) {
          Object.keys(objectProperties).forEach((property) => {
            objectProperties[property].forEach((objIRI) => {
              if (!filteredIndividuals.hasOwnProperty(objIRI)) {
                individuals.forEach((objectIndividual) => {
                  if (objectIndividual["uri"] === objIRI) {
                    filteredIndividuals[objIRI] = objectIndividual;
                    addObjectProperties(objectIndividual["object_properties"]);
                  }
                });
              }
            });
          });
        }

        addObjectProperties(objectProperties);
      }
    });
  });

  return Object.values(filteredIndividuals);
}

(() => {
  const refreshInterval = 3000;
  setInterval(run, refreshInterval);
})();
