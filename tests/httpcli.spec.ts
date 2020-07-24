import Client from '../src/client/SecureWebRequestClient';

const myCli = new Client('https://redsky.target.com');

myCli.getJsonResponse(['v2', 'pdp', 'tcin', '13860428']).then((resp: object): void => {
  console.log(JSON.stringify(resp));
});
