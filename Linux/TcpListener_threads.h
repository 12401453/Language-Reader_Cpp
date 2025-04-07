#include <iostream>
#include <sys/types.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netdb.h>
#include <arpa/inet.h>
#include <string.h>
#include <string>
#include <sys/select.h>

class TcpListener {
    public:
        TcpListener(const char* ipAddress, int port) :
            m_ipAddress{ipAddress}, m_port{port} { }

        int init();
        int run();       

   
    //protected is to allow only classes derived from this class access 
    protected:

        virtual void onClientConnected(int clientSocket);
        virtual void onClientDisconnected(int clientSocket);
        virtual void onMessageReceived(int clientSocket, const char *msg, int length, int get_or_post, int headers_length, int content_length=0);
        void sendToClient(int clientSocket, const char* msg, int length);
        void broadcastToClients(int sendingClient, const char* msg, int length);

        bool c_strStartsWith(const char* str1, const char* str2);
        int c_strFind(const char* haystack, const char* needle);
        int getRequestType(const char* msg);


    private:

        int getContentLength(char* c_str_message_buf);

        const char*         m_ipAddress;
        int                 m_port;
        int                 m_socket;
        fd_set              m_master;
        
};