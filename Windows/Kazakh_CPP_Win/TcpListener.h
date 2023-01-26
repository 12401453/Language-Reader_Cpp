#pragma once
#include <iostream>
#include <sys/types.h>
#include <WS2tcpip.h>
#pragma comment (lib, "ws2_32.lib")
#include <string.h>

class TcpListener {
public:
	TcpListener(const char* ipAddress, int port) : m_ipAddress{ipAddress}, m_port{port} {}
	
	int init();
	int run();

protected:
	virtual void onClientConnected(SOCKET clientSocket);
	virtual void onClientDisconnected(SOCKET clientSocket);
	virtual void onMessageReceived(SOCKET clientSocket, const char* msg, int length);
	void sendToClient(SOCKET clientSocket, const char* msg, int length);
	//void broadcastToClients(SOCKET sendingClient, const char* msg, int length);

private:
	const char*		m_ipAddress;
	int				m_port;
	SOCKET			m_socket;
	fd_set			m_master;

};