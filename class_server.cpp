#include "MultiClientChat.h"

int main(int argc, char *argv[]) {
  /*  TcpListener serv = TcpListener("192.168.1.242", 4300);

    serv.init();
    serv.run();
*/  int portno = atoi(argv[1]);
    MultiClientChat mcc("0.0.0.0", portno);
    if(mcc.init() != 0) {
        std::cout << "FUCK! init failed" << std::endl;
        return 0;
    } 
    mcc.run();
    return 0;
}
