const express = require('express');

function waitMs(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  const app = express();

  app.get('/testing/:id', (req, res) => {
    res.send(`req: ${req.params.id}`);
  });

  app.listen(3451);

  while (true){ await waitMs(10000); }
}

main();
