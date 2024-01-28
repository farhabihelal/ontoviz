document.addEventListener("DOMContentLoaded", () => {
  reset();
  createGraph([], []);
  run();
});

document
  .getElementById("switch-test-mode")
  .addEventListener("click", function (event) {
    // Stop the propagation of the click event
    event.stopPropagation();

    enableTest = !enableTest;
    run();
  });

function reset() {
  document.getElementById("switch-test-mode").checked = false;
}
