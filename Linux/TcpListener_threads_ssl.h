#include <iostream>
#include <sys/types.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netdb.h>
#include <arpa/inet.h>
#include <string.h>
#include <string>
#include <sys/select.h>
#include <openssl/ssl.h>
#include <openssl/err.h>

class TcpListener {
    public:
        TcpListener(const char* ipAddress, int port) :
            m_ipAddress{ipAddress}, m_port{port} { }

        int init();
        int run();       

   
    //protected is to allow only classes derived from this class access 
    protected:

        struct ClientConnection {
            int client_socket;
            SSL* ssl;
        };

        virtual void onClientConnected(ClientConnection* ssl_conn_ptr);
        virtual void onClientDisconnected(int clientSocket);
        virtual void onMessageReceived(ClientConnection* ssl_conn_ptr, const char *msg, int length, int get_or_post, int headers_length, int content_length=0);
        void sendToClient(ClientConnection* ssl_conn_ptr, const char* msg, int length);
        void broadcastToClients(int sendingClient, const char* msg, int length);

        void sslCloseConnection(ClientConnection* ssl_conn_ptr);

        bool c_strStartsWith(const char* str1, const char* str2);
        int c_strFind(const char* haystack, const char* needle);
        int getRequestType(const char* msg);

    private:

        int getContentLength(char* c_str_message_buf);

        const char*         m_ipAddress;
        int                 m_port;
        int                 m_socket;
        fd_set              m_master;
        SSL_CTX*            m_ctx;

        
};