//compile with 
//    g++ -lsqlite3 -licuuc -licui18n -licudata TcpListener.cpp WebServer.cpp main.cpp -o webserv
// or 
//    g++ -lsqlite3 `pkg-config --libs --cflags icu-uc icu-io` TcpListener.cpp WebServer.cpp main.cpp -o webserv

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
