document.addEventListener("DOMContentLoaded", () => {
  reset();
});

document
  .getElementById("switch-test-mode")
  .addEventListener("click", function (event) {
    // Stop the propagation of the click event
    event.stopPropagation();

    enableTest = !enableTest;
    refresh();
  });

function reset() {
  console.log("Reseting ...");
  document.getElementById("switch-test-mode").checked = false;
  refresh();
}

function refresh() {
  console.log("Refreshing ...");
  resetGraph();
  run();
}
