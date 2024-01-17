function isIRI(str) {
  return str.match(/^http:\/\/.+/);
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

function parseDataProperty(propertyValue) {
  let parsedValue = propertyValue;

  if (typeof propertyValue == "string") {
    const split = propertyValue.split("^^");
    parsedValue = split[0].replace(/"/g, "");
    const type = split.length == 2 ? split[1] : "";

    if (
      type == "http://www.w3.org/2001/XMLSchema#integer" ||
      type == "http://www.w3.org/2001/XMLSchema#decimal" ||
      type == "http://www.w3.org/2001/XMLSchema#float" ||
      type == "http://www.w3.org/2001/XMLSchema#double" ||
      !isNaN(parsedValue)
    ) {
      parsedValue = Number(parsedValue);
    } else if (type == "http://www.w3.org/2001/XMLSchema#boolean") {
      parsedValue = parsedValue.toLowerCase() == "true";
    }
  }

  return {
    value: parsedValue,
    type: "",
  };
}
