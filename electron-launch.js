const output = document.getElementById('output');

window.electron.onConsoleOutput((msg) => {
  output.innerHTML += msg;
  window.scrollTo(0, document.body.scrollHeight);
});
