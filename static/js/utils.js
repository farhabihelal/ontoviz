function sortData(data) {
  // Return non-objects
  if (typeof data != "object") {
    return data;
  }

  // Sort arrays and return
  if (Array.isArray(data)) {
    return data.sort();
  }

  let sortedData = {};

  Object.keys(data)
    .sort()
    .forEach((key) => {
      sortedData[key] = sortData(data[key]);
    });

  return sortedData;
}

function test() {
  const data = {
    types: [
      "http://www.semanticweb.org/pizzatutorial/ontologies/2020/PizzaTutorial#Customer",
    ],
    data_properties: {
      "http://www.semanticweb.org/pizzatutorial/ontologies/2020/PizzaTutorial#numberOfPizzasPurchased":
        ['"20"^^xsd:integer'],
      "http://www.semanticweb.org/pizzatutorial/ontologies/2020/PizzaTutorial#hasPhone":
        ["555-789-1234", "555-790-1234"],
      "http://www.semanticweb.org/pizzatutorial/ontologies/2020/PizzaTutorial#ssn":
        ["333-22-4444"],
    },
    object_properties: {
      "http://www.semanticweb.org/pizzatutorial/ontologies/2020/PizzaTutorial#hasSpicinessPreference":
        [
          "http://www.semanticweb.org/pizzatutorial/ontologies/2020/PizzaTutorial#Mild",
        ],
      "http://www.semanticweb.org/pizzatutorial/ontologies/2020/PizzaTutorial#purchasedPizza":
        [
          "http://www.semanticweb.org/pizzatutorial/ontologies/2020/PizzaTutorial#AmericanaHotPizza2",
          "http://www.semanticweb.org/pizzatutorial/ontologies/2020/PizzaTutorial#AmericanaHotPizza3",
        ],
    },
  };

  const result = sortData(data);
  console.log(result);
}

test();
