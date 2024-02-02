var graph = null;
var enableTest = false;
var lastRawData = null;
var style = vizualizationStyleProfiles["tv"];

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

function createGraph(nodes, edges, style) {
  container = document.getElementById("cy");

  elements = [];

  Object.keys(nodes).forEach((key) => {
    elements.push(nodes[key]);
  });

  Object.keys(edges).forEach((key) => {
    elements.push(edges[key]);
  });

  console.log(`elements : ${elements}`);

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

  // Event listener for node click
  graph.on("click", "node", function (event) {
    const clickedNode = event.target;

    // Remove highlight from previously clicked elements
    graph.elements().removeClass("highlighted");

    // Highlight the clicked node
    clickedNode.addClass("highlighted");

    const connectedNodes = clickedNode.outgoers().nodes();
    connectedNodes.addClass("highlighted");

    // Highlight connected edges
    const outgoingEdges = clickedNode.outgoers().edges();
    outgoingEdges.addClass("highlighted");

    // Styles for the highlighted elements
    graph
      .style()
      .selector(".highlighted")
      .css({
        "line-color": "red", // Change this to the desired line color for edges
        "border-color": "red", // Change this to the desired border color for nodes
        "border-width": "8px", // Change this to the desired border width for nodes
      })
      .update();
  });

  // Event listener for canvas tap
  graph.on("tap", function (event) {
    // Check if the tap event target is the canvas (not a node)
    if (event.target === graph) {
      // Reset styles or perform other actions for all nodes
      graph.elements().removeClass("highlighted");
    }
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

  if (!hasDataChanged(lastRawData, rawData)) {
    console.log("No change in data. Skipping graph update.");
    return;
  }

  console.log("Data has changed! Updating graph.");
  update(rawData);
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
  const refreshIntervalMs = 3000;
  setInterval(run, refreshIntervalMs);
})();

function sortData(data) {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sortData);
  }

  const sortedKeys = Object.keys(data).sort();
  const sortedData = {};

  sortedKeys.forEach((key) => {
    sortedData[key] = sortData(data[key]);
  });

  return sortedData;
}

function hasDataChanged(oldData, newData) {
  return (
    oldData === null ||
    JSON.stringify(sortData(oldData)) !== JSON.stringify(sortData(newData))
  );
}

function resetGraph() {
  console.log("Reseting graph...");
  graph ? updateGraph([], [], []) : createGraph([], [], style.style);
  lastRawData = null;
}
