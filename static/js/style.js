var vizualizationStyleProfiles = {
  default: {
    style: [
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
    ],
  },
  tv: {
    style: [
      {
        selector: ".individual-node",
        style: {
          width: 200,
          height: 200,
          "background-color": "blue",
          label: "data(label)",
          "text-valign": "bottom",
          "text-halign": "center",
          "text-margin-y": "10px",
          "text-background-color": "#fff",
          "text-background-opacity": 0.0,
          "text-background-padding": "3px",
          "font-family": "Arial, sans-serif",
          "font-size": "42px",
          shape: "circle",
        },
      },
      {
        selector: ".type-node",
        style: {
          width: 160,
          height: 160,
          "background-color": "green",
          label: "data(label)",
          "text-valign": "bottom",
          "text-halign": "center",
          "text-margin-y": "10px",
          "text-background-color": "#fff",
          "text-background-opacity": 0.0,
          "text-background-padding": "3px",
          "font-family": "Arial, sans-serif",
          "font-size": "38px",
          shape: "rectangle",
        },
      },
      {
        selector: ".property-node",
        style: {
          width: 140,
          height: 140,
          "background-color": "red",
          label: "data(label)",
          "text-valign": "bottom",
          "text-halign": "center",
          "text-margin-y": "10px",
          "text-background-color": "#fff",
          "text-background-opacity": 0.0,
          "text-background-padding": "3px",
          "font-family": "Arial, sans-serif",
          "font-size": "36px",
          shape: "triangle",
        },
      },
      {
        selector: "edge",
        style: {
          width: 5,
          "line-color": "#ccc",
          "target-arrow-color": "#ccc",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          label: "data(label)", // Set label on the edge
          "source-endpoint": "outside-to-line",
          "target-endpoint": "outside-to-line",
          "arrow-scale": 3,
          "text-background-color": "#fff",
          "text-background-opacity": 0.7,
          "text-background-padding": "3px",
          "font-family": "Arial, sans-serif",
          "font-size": "34px",
        },
      },
    ],
  },
};
