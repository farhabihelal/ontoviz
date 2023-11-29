function autoReloadWindow(interval = 500) {
  setInterval(function () {
    location.reload(true);
  }, interval);
}

autoReloadWindow(1000);
