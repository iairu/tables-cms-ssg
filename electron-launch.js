const output = document.getElementById('output');

window.electron.onConsoleOutput((msg) => {
  output.textContent += msg + '\n';
  window.scrollTo(0, document.body.scrollHeight);
});
