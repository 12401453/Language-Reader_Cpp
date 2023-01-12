#include "WebServer.h"

int main(int argc, char* argv[]) {

    if (argc < 2) {
        std::cout << "Need to specify portnumber" << std::endl;
        return 0;
    }

    int portno = atoi(argv[1]);
    WebServer webserv("0.0.0.0", portno);
    if (webserv.init() != 0) {
        std::cout << "Init failed" << std::endl;
        return 0;
    }
    webserv.run();
    return 0;
}