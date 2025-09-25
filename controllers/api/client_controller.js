export default class ClientController {
  doGet(request, response, id) {
    response.writeHead(200);
    response.end("ClientController");
  }
}