import WebSocketService from "./websocketService"; // Importa il servizio WebSocket

// Funzione per prelevare i dati dalla WebSocket
export const fetchDataFromWebSocket = () => {
  WebSocketService.sendMessage("Dati richiesti");
};
