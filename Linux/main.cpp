//compile with
//  g++ TcpListener.cpp WebServer.cpp main.cpp -lsqlite3 -licuuc -licudata -licui18n -lcurl -o webserv
//run with
//  ./webserv <portnumber> [silent]

#include "WebServer.h"

int main(int argc, char *argv[]) {
    
    if(argc < 2) {
        std::cout << "Need to specify portnumber" << std::endl;
        return 0;
    }

    bool show_output = true;
    if(argc > 2) {
        const char* output_flag = argv[2];
        if(!strcmp(output_flag, "silent")) show_output = false;
    }
    
    int portno = atoi(argv[1]);
    WebServer webserv("0.0.0.0", portno, show_output);
    if(webserv.init() != 0) {
        std::cout << "Init failed" << std::endl;
        return 0;
    } 
    webserv.run();
    return 0;
}
