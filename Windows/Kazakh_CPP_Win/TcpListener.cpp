#include "TcpListener.h"

int TcpListener::init() {
	WSADATA wsData;
	WORD ver = MAKEWORD(2, 2);

	int wSok = WSAStartup(ver, &wsData);

	if (wSok != 0) {
		std::cerr << "Can't initialise WinSock" << std::endl;
		return -10;
	}

	m_socket = socket(AF_INET, SOCK_STREAM, 0);
	if (m_socket == INVALID_SOCKET) {
		std::cerr << "socket() failed" << std::endl;
		return -1;
	}

	sockaddr_in hint;
	hint.sin_family = AF_INET;
	hint.sin_port = htons(m_port);
	inet_pton(AF_INET, m_ipAddress, &hint.sin_addr);

	if (bind(m_socket, (sockaddr*)&hint, sizeof(hint)) == SOCKET_ERROR) {
		std::cerr << "Can't bind to IP/port" << std::endl;
		return -2;
	}

	if (listen(m_socket, SOMAXCONN) == SOCKET_ERROR) {
		std::cerr << "listen() failed" << std::endl;
		return -3;
	}

	//this zeroes out the master file-descriptor set
	FD_ZERO(&m_master);

	//this puts our listening socket into the master file-descriptor set
	FD_SET(m_socket, &m_master);

	return 0;
}

int TcpListener::run() {

bool running = true;

while (running) {
	
	fd_set master_copy = m_master;

	//select() returns the number of filedescriptors (sockets) in the fd_set with data to read on them 
	//FD_SETSIZE is 1024 on Linux but 64 on Windows, and the Windows select() syscall ignores the first argument anyway so I don't need FD_SETSIZE and will follow Scottish bloke's method
	int socketCount = select(0, &master_copy, nullptr, nullptr, nullptr);
	if (socketCount == SOCKET_ERROR) {
		std::cerr << "select() failed" << std::endl;
		return -4;
	}

	//we loop through the sockets stored in the fd_set master_copy
	for (int i = 0; i < socketCount; i++) {

		//in Linux this is just int sock = i, because Linux sockets are just pure file-descriptors (numbers), while in Windows they have their own type
		SOCKET sock = master_copy.fd_array[i];

		if (FD_ISSET(sock, &master_copy)) {
			
			//if the socket we come to in the loop is the listening socket then we call accept() on it, which puts our listening socket into a state of being able to accept new connections. It returns a file-descriptor to a new socket, which will be used for the client which eventually connects. This new client socket is then added to the fd_set m_master using FD_SET()
			if (sock == m_socket) {
				std::cout << "sock == listening" << std::endl;
				SOCKET client = accept(m_socket, nullptr, nullptr);
				FD_SET(client, &m_master);

				onClientConnected(client); //this function is empty for now
			}
			else {
				std::cout << "socket != listening" << std::endl;
				char buf[4096];
				memset(buf, 0, 4096);
				int bytesIn = recv(sock, buf, 4095, 0);

				if (bytesIn <= 0) {
					std::cout << "bytesIn <= 0\nClient disconnected\n" << std::endl;
					onClientDisconnected(sock);
					closesocket(sock);
					FD_CLR(sock, &m_master);
				}
				else {
					std::cout << "bytesIn > 0" << std::endl;
					onMessageReceived(sock, buf, bytesIn);
				}
			}
		}
	}	
}

//this stuff should never get run as it's outside the while(true) loop, and I've not put it in the Linux version
FD_CLR(m_socket, &m_master);
closesocket(m_socket);

while (m_master.fd_count > 0) {
	//removes all remaining file-descriptors (sockets) from the m_master fd_set
	FD_CLR(m_master.fd_array[0], &m_master);
	closesocket(m_master.fd_array[0]);
}
WSACleanup();
return 0;
}

void TcpListener::sendToClient(SOCKET clientSocket, const char* msg, int length) {
	send(clientSocket, msg, length, 0);
}

void TcpListener::onMessageReceived(SOCKET clientSocket, const char* msg, int length) {

}

void TcpListener::onClientConnected(SOCKET clientSocket) {

}

void TcpListener::onClientDisconnected(SOCKET clientSocket) {

}

//useful only in chat-client applications
/*
void TcpListener::broadcastToClients(SOCKET sendingClient, const char* msg, int length) {
	for (int i = 0; i < FD_SETSIZE; i++) {
		SOCKET outSock = m_master.fd_array[i];

		if (outSock != sendingClient && outSock != m_socket) {
			sendToClient(outSock, msg, length);
		}
	}
}
*/