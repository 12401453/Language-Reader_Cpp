#include <sstream>
#include <fstream>
#include "WebServer.h"

void WebServer::onClientConnected(int clientSocket) {

}

void  WebServer::onClientDisconnected(int clientSocket) {
    
    
}

void WebServer::onMessageReceived(int clientSocket, const char* msg, int length) {

  //  char c_get_header[4]; //I think the array brackets act like a pointer symbol because arrays are just pointers
  

 //   for (int i = 0; i < 3; i++)
  //  {
 //        c_get_header[i] = msg[i];
 //   } 


    //test of new strcmp method

    #define GET 3
    #define POST 4
  /*  const char *req_method = "GET";
    int strcmp_count = 0;
    const char* msg_copy = msg;
    while(*req_method && (*req_method == *msg_copy)) {
        strcmp_count++;
        req_method++;
        msg_copy++;
    }
    std::cout << "String-compare count: " << strcmp_count << std::endl;
*/
    int get_or_post = getRequestType(msg);
    std::cout << get_or_post << std::endl; 
 //   c_get_header[3] = '\0';

 //   std::string strget_header {c_get_header};
    if (get_or_post == GET)
    {
        std::cout << "This is a GET request" << std::endl;

        int lb_pos = 0;
        for (int i = 0; i < 1024; i++)
        {

            if (msg[i] == '\x0d')
                break;
            std::cout << msg[i];
            lb_pos++;
        }
        std::cout << std::endl;
        std::cout << "lb_pos: " << lb_pos << std::endl;
        char msg_substr[lb_pos - 12];
        std::cout << "size of msg_substr array: " << sizeof(msg_substr) << std::endl;

        for (int i = 4; i < lb_pos - 9; i++)
        {
            msg_substr[i - 4] = msg[i];
            std::cout << msg[i];
        }
        msg_substr[lb_pos - 13] = '\0';
        std::cout << std::endl;

      /*  std::string documentRoot = "/home/joe/Programs/networking/WebServer";
        std::string url_str{msg_substr}; */

        const char *docRoot_c_str = "/home/joe/Programs/networking/WebServer";
        printf("docRoot array size: %i\n", strlen(docRoot_c_str) + 1);
        int url_size = strlen(docRoot_c_str) + sizeof(msg_substr); //sizeof() can be used for c-strings declared as an array of char's but strlen() must be used for char *pointers
        char url_c_str[url_size];
        printf("\n%s\n", msg_substr);
        strcpy(url_c_str, docRoot_c_str);
        printf("\n%s\n", msg_substr);
        strcat(url_c_str, msg_substr);
        printf("\n%s\n", msg_substr);

        

        std::ifstream urlFile;
        urlFile.open(url_c_str);
        std::string content = "<h1>404 Not Found</h1>";
        if (urlFile.good())
        {
            std::cout << "This file exists and was opened successfully." << std::endl;

            std::ostringstream ss_text;
            std::string line;
            while (std::getline(urlFile, line))
            {
                ss_text << line << '\n';
            }

            content = ss_text.str();

            urlFile.close();
        }
        else
        {
            std::cout << "This file was not opened successfully." << std::endl;
        }

        std::string content_type = "text/html";
        
        char fil_ext[5];
        for(int i = 0; i < 4; i++) {
            fil_ext[i] = url_c_str[url_size - 5 + i];
        }
        fil_ext[4] = '\0';
        printf("fil_ext = %s\n", fil_ext);

        if(!strcmp(fil_ext, ".css")) {
            content_type = "text/css";
        }


        std::ostringstream oss;
        oss << "HTTP/1.1 200 OK \r\n";
    //    oss << "Cache-Control: no-cache, private \r\n";
        oss << "Content-Type: " << content_type << "\r\n";
        oss << "Content-Length: " << content.size() << "\r\n";
        oss << "\r\n";
        oss << content;

        std::string output = oss.str();
        int size = output.size() + 1;

        sendToClient(clientSocket, output.c_str(), size);
    }
    else {
        std::cout << "This is where the fun begins" << std::endl;
        if(get_or_post == POST) {
            std::cout << "This is a POST request" << std::endl;
        }
    } 

 /*   std::ifstream f;
    f.open("mat7_html.html");
    std::string content = "<h1>404 Not Found</h1>";

    if(f.good()) {
        std::stringstream ss_text;
        std::string line;
        while(std::getline(f, line)) {
            ss_text << line << '\n';
        }

        content = ss_text.str();
    }

    std::ostringstream oss;
    oss <<"HTTP/1.1 200 OK \r\n";
    oss << "Cache-Control: no-cache, private \r\n";
    oss << "Content-Type: text/html\r\n";
    oss << "Content-Length: " << content.size() << "\r\n";
    oss << "\r\n";
    oss << content;

    std::string output = oss.str();
    int size = output.size() + 1;

    sendToClient(clientSocket, output.c_str(), size);

    f.close(); */
    printf("\n--------------------------------------MESSAGE BEGIN--------------------------------------------------\n\n");
    printf("%s", msg);
    printf("\n-----------------------------------------------------------------------------------------------------\n");
    printf("Size of the above message is %i bytes\n\n", length);
/*
    
    int lb_pos = 0; 
    // I think the array brackets act like a pointer symbol because arrays are just pointers
    for (int i = 0; i < 300; i++)
    {
        
        if(msg[i] == '\x0d') break;
        std::cout << msg[i];
        lb_pos++;
    }
    std::cout << std::endl;
    std::cout << "lb_pos: " << lb_pos << std::endl;
    char msg_substr[lb_pos - 12];
    std::cout << "size of msg_substr array: " << sizeof(msg_substr) << std::endl;

    for(int i = 4; i < lb_pos - 9; i++) {
        msg_substr[i-4] = msg[i];
        std::cout << msg[i];
    }
    msg_substr[lb_pos - 13] = '\0';
    std::cout << std::endl;

  /*  std::string url_str{msg_substr};
    std::cout << url_str << std::endl; */
/*
    std::ifstream urlFile;
    urlFile.open(msg_substr);
    if(urlFile.good()) {
        std::cout << "This file exists and was opened successfully." << std::endl;
        urlFile.close();
    }
    else {
        std::cout << "This file was not opened successfully." << std::endl;
    }
    */
}

int WebServer::getRequestType(const char* msg ) {

    const char *get_method = "GET";
    const char* post_method = "POST";
    int strcmp_count = 0;
    const char *msg_copy = msg;
    while (*get_method && (*get_method == *msg_copy))
    {
        strcmp_count++;
        get_method++;
        msg_copy++;
    }
    if(strcmp_count == 3) {
        return 3;
    }
    else{
        while (*post_method && (*post_method == *msg_copy))
        {
            strcmp_count++;
            post_method++;
            msg_copy++;
        }
        if(strcmp_count == 4) {
            return 4;
        }
        else return -1;
    }
    std::cout << "String-compare count: " << strcmp_count << std::endl;
}
