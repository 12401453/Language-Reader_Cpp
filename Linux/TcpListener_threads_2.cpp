#include "TcpListener_threads.h"
#include <thread>
#include <fcntl.h>

#define GET 3
#define POST 4

int TcpListener::init() {

    m_socket = socket(AF_INET, SOCK_STREAM, 0); //AF_INET and SOCK_STREAM are both constants defined by a #define macro to be = 1
    if (m_socket == -1) {
        std::cerr << "socket() failed" << std::endl;
        return -1;
    }
    sockaddr_in hint;
    hint.sin_family = AF_INET;
    hint.sin_port = htons(m_port); //host-to-network-short converts little-endian binary representation of the port-number to big-endian
    //inet_pton is "internet pointer-to-a-string-to-a-number", and it assigns an IP address to the sin_addr field of the sockaddr_in hint struct
    inet_pton(AF_INET, m_ipAddress, &hint.sin_addr); //converts IP in format 127.0.0.1 to an array of integers. The third parameter is a pointer to the field of the hint struct which we are filling out with the format-converted IP address

    //the second argument of bind() is the pointer to the sockaddr_in called hint, except it only accepts pointers to structs of type sockaddr, not sockaddr_in, so we have to cast the mem address of our hint struct to a pointer to a plain sockaddr struct, which is what the (sockaddr*) operator does
    //the bind() and listen() functions are called simultaneously with checking their return values, which is a bit unclear imo, but it saves declaring unneccesary variables to hold their return values
    if (bind(m_socket, (sockaddr*)&hint, sizeof(hint)) == -1) {
        std::cerr << "Can't bind to IP/port" << std::endl;
        return -2;
    }
    if (listen(m_socket, SOMAXCONN) == -1) {
        std::cerr << "listen() failed" << std::endl;
        return -3;
    }

    FD_ZERO(&m_master);

    FD_SET(m_socket, &m_master);

    //printf("m_socket is: %d\n", m_socket);

    return 0;

}

int TcpListener::run() {

    bool running = true;

    while(running) {
        fd_set master_copy = m_master;

        //select will only return when a file descriptor in the fd_set master_copy gets data on it to read (the initial connection will put data to read on the listening-socket, m_socket, but once we call accept() on that and add the new client-socket to our fd_set, the client will write its actual message-data to the new client-socket, and nothing will be left on the listening-socket, so select() on its second go-through the loop will only signal data on the client-socket and will yeet any barren sockets (i.e. the listening-socket m_master) from its fd_set argument)
        if(select(FD_SETSIZE, &master_copy, nullptr, nullptr, nullptr) < 0) {
            std::cerr << "select() is fucked main thread";
            perror("select() error");
            return -4;
        }
        //select() modifies the master_copy variable so it only includes those file-descriptors (sockets) which are ready for I/O, in this case reading, which means on the second-pass of this loop the listening-socket is yeeted from master_copy and only the client-socket remains

        //printf("%s\n", "select() has returned");
        for(int i = 0; i < FD_SETSIZE; i++) {
            int sock = i;//master_copy.fd_array[i];

            //select() has yeeted any non-readable sockets from master_copy, so once accept() has been called on the listening-socket and the client-socket added to m_master, this FD_ISSET() call only returns true for the client-socket 
            if(FD_ISSET(sock, &master_copy)) {

                //this only gets called if the listening socket is determined to have some data for us to read by select(), which only happens when a client connects to the server on the listening socket, so this only triggers upon new client connections
                if (sock == m_socket) {
                    std::cout << "sock == listening - Client connected" << std::endl;
                    
                    
                    
                    int client = accept(m_socket, nullptr, nullptr);
                    printf("accepted client: %d\n", client);
                    //FD_SET(client, &m_master);
                    
                    //std::thread(onClientConnected, client).detach();

                    std::thread([this, client]() {
                        this->onClientConnected(client);
                    }).detach();

                }
            }
        }
        //printf("looping through fd_set master_copy is complete\n");
    }
    return 0;
}

void TcpListener::sendToClient(int clientSocket, const char* msg, int length) {

    send(clientSocket, msg, length, 0);
}
/*
void TcpListener::broadcastToClients(int sendingClient, const char* msg, int length) {
    for (int i = 0; i < FD_SETSIZE; i++) {
        int outSock = i;//master.fd_array[i];

        //the outSock is another connected client socket, so this code is only called if more than one client is connected (if the outSock is a member of the fd_set master). It loops round and sends the incoming data in buf to each outSock it finds so that the message gets to each client, but it has to differentiate between other connected clients and the main listening socket (which listens for new client connections) and the client which is currently writing to the server (stored in sock), which is why we have the second if-statement; it writes the contents of buf to all the sockets in fd_set master EXCEPT the listening socket and the client-socket which wrote the message

        if(outSock != m_socket && outSock != sendingClient) {
            sendToClient(outSock, msg, length);
        }

    }

} */

void TcpListener::onMessageReceived(int clientSocket, const char *msg, int length, int get_or_post, int headers_length, int content_length) {

}

void TcpListener::onClientConnected(int clientSocket) {
    //printf("Client-socket of number %d connected\n", clientSocket);

    char c_str_message_buffer[16384];
    char* c_str_msg_write_position = c_str_message_buffer;
    memset(c_str_message_buffer, 0, 16384);
    int message_size = 0;
    printf("entered onClientConnect()\n");

    int headers_length = -1;
    while (headers_length == -1) {

        if(message_size > 8192) {
            sendToClient(clientSocket, "HTTP/1.1 400 Bad Request\r\nContent-Type: text/html\r\nContent-Length: 23\r\n\r\nMal-formed HTTP request", 97);
            close(clientSocket);
            onClientDisconnected(clientSocket);
            std::cout << "The headers have been going on for more than 8192 bytes, suggesting a mal-formed incoming HTTP message. Aborting...\n";
            return;
        }

        char buf[4096];
        memset(buf, 0, 4096);
        int bytesIn = recv(clientSocket, buf, 4096, 0);
        message_size += bytesIn;
        
        c_str_msg_write_position = (char*)mempcpy(c_str_msg_write_position, buf, bytesIn);

        headers_length = c_strFind(c_str_message_buffer, "\r\n\r\n");

    }
    std::cout << c_str_message_buffer << "\n";

    int get_or_post = getRequestType(c_str_message_buffer);
    if(get_or_post == GET) {
        onMessageReceived(clientSocket, c_str_message_buffer, message_size + 1, get_or_post, headers_length);
        close(clientSocket);
        onClientDisconnected(clientSocket);
        return;
    }  
    else if (get_or_post == -1) {
        sendToClient(clientSocket, "HTTP/1.1 405 Method Not Allowed\r\nContent-Type: text/html\r\nContent-Length: 23\r\n\r\nNeither a GET nor a POST request... REPENT!", 124);
        close(clientSocket);
        onClientDisconnected(clientSocket);
        std::cout << "The headers have been going on for more than 8192 bytes, suggesting a mal-formed incoming HTTP message. Aborting...\n";
        return;
    }
    //no need for final else because the other two branches return

    int content_length = getContentLength(c_str_message_buffer);
    int total_message_length = headers_length + 4 + content_length;

    if(total_message_length < 16384) {
        printf("Stack-allocating HTTP message-buffer...\n");
        while(message_size < total_message_length) {
            printf("in recv() loop\n");
            char buf[4096];
            memset(buf, 0, 4096);
            int bytesIn = recv(clientSocket, buf, 4096, 0);
            bytesIn = message_size + bytesIn < total_message_length ? bytesIn : total_message_length - message_size; //if the client lies and sends more data than its Content-Length says, then we want to cap the amount we read off the socket to be below the amount which will overflow our buffer
            message_size += bytesIn;
            c_str_msg_write_position = (char*)mempcpy(c_str_msg_write_position, buf, bytesIn);
        }
        printf("message_size: %i\n", message_size);
        printf("%s\n", c_str_message_buffer);
        onMessageReceived(clientSocket, c_str_message_buffer, message_size + 1, get_or_post, headers_length, content_length); //need to send an extra \0 from the buffer to null-terminate the message
        
        close(clientSocket);

        onClientDisconnected(clientSocket);

        return;
    }
    else {
        printf("Heap-allocating HTTP message-buffer...\n");
        std::string message_buffer;
        printf("Heap-allocated POST message up to the end of the headers:\n\n%s\n\n", c_str_message_buffer);
        message_buffer.append(c_str_message_buffer, message_size);
        while(message_size < total_message_length) {
            char buf[4096];
            memset(buf, 0, 4096);
            int bytesIn = recv(clientSocket, buf, 4096, 0);
            message_size += bytesIn;
            message_buffer.append(buf, bytesIn);
        }
        printf("message_size: %i\n", message_size);
        onMessageReceived(clientSocket, message_buffer.c_str(), message_size + 1, get_or_post, headers_length, content_length); //calling .c_str() should return a null-terminated-string so need an extra byte in the size
        
        close(clientSocket);

        onClientDisconnected(clientSocket);

        return;
    }   

}

void TcpListener::onClientDisconnected(int clientSocket) {
    printf("Client-socket of number %d has disconnected\n", clientSocket);
}

bool TcpListener::c_strStartsWith(const char *str1, const char *str2)
{
    int strcmp_count = 0;
    int str2_len = strlen(str2);
 
    int i = -1;
   
    while ((*str1 == *str2 || *str2 == '\0') && i < str2_len)
    {
        strcmp_count++;
        str1++;
        str2++;
        i++;
    }
 
    if (strcmp_count == str2_len + 1)
    {
        return true;
    }
    else
        return false;
}

int TcpListener::c_strFind(const char* haystack, const char* needle) {

    int needle_startpos = 0;
    int needle_length = strlen(needle);
    int haystack_length = strlen(haystack);
    if(haystack_length < needle_length) return -1;
    char needle_buf[needle_length + 1]; //yes I'm stack-allocating variable-length arrays because g++ lets me and I want the efficiency; it will segfault just the same if I pre-allocate an arbitrary length array which the data is too big for anyway, and I absolutely will not use any of the heap-allocated C++ containers for the essential HTTP message parsing, which needs to be imperceptibly fast

    needle_buf[needle_length] = '\0';
    for(int i = 0; i < haystack_length; i++) {
        for(int j = 0 ; j < needle_length; j++) {
            needle_buf[j] = haystack[j];
        }
       
        if(c_strStartsWith(needle_buf, needle)) {
            break;
        }
        needle_startpos++;
        haystack++;
    }
    
    if(needle_startpos == haystack_length) {
        return -1;
        }
    else {
        return needle_startpos;
    } 
}

int TcpListener::getContentLength(char* c_str_message_buffer) {
    int content_length_start = c_strFind(c_str_message_buffer, "Content-Length:") + 16; //should be case-insensitive to conform with the spec; clients that send content-length will break
        
    int cl_figures = 0;
    char next_nl = 'c';
    while(next_nl != '\x0d') {
        next_nl = c_str_message_buffer[content_length_start + cl_figures];
        cl_figures++;
    }
    cl_figures--;
    std::cout << "Number of digits in content-length: " << cl_figures << std::endl;

    char content_length_str[cl_figures + 1];
    for(int i = 0; i < cl_figures; i++) {
        content_length_str[i] = c_str_message_buffer[content_length_start + i];
    }
    content_length_str[cl_figures] = '\0';
    int content_length = atoi(content_length_str);
    std::cout << "Parsed-out content-length: " << content_length << std::endl;
    
    return content_length;
}

int TcpListener::getRequestType(const char* msg) {

    if(c_strStartsWith(msg, "GET")) {
        return 3;
    }
    else if(c_strStartsWith(msg, "POST")) {
        return 4;
    }
    else return -1;
}