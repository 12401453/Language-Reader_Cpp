#include "MultiClientChat.h"

//these are defined empty in TcpListener.cpp so they're declared in the .h file as virtual so they can be overridden here with these implementations
void MultiClientChat::onClientConnected(int clientSocket) {
    std::string welcomeMsg = "Welcome to chat server\n";
    sendToClient(clientSocket, welcomeMsg.c_str(), welcomeMsg.size() + 1);
}
void MultiClientChat::onClientDisconnected(int clientSocket) {

}
void MultiClientChat::onMessageReceived(int clientSocket, const char *msg, int length) {

    broadcastToClients(clientSocket, msg, length);

}
