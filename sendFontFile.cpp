#include "WebServer.cpp"
#include <sys/stat.h>

 void sendFontFile(char* url_c_str) {

    std::ifstream urlFile(url_c_str, std::ios::binary);
    if (urlFile.good())
    {
        std::cout << "This file exists and was opened successfully." << std::endl;

        struct stat size_result;    
        int font_filesize = 0;
        if(stat(url_c_str, &size_result) == 0) {
            font_filesize = size_result.st_size;
        }
        else {
            std::cout << "Error reading fontfile size" << std::endl;
            return;
        }
        std::string headers =  "HTTP/1.1 200 OK\r\nContent-Type: font/ttf\r\nContent-Length: "+ std::to_string(font_filesize) + "\r\n\r\n";
        int headers_size = headers.size();
        const char* headers_c_str = headers.c_str();
        
        if(font_filesize < 1048576) {
            char content_buf[headers_size + font_filesize + 1];

            memcpy(content_buf, headers_c_str, headers_size); //.size() leaves off null-termination in its count

            urlFile.read(content_buf + headers_size, font_filesize);

            content_buf[headers_size + font_filesize] = '\0';

            sendToClient(clientSocket, content_buf, headers_size + font_filesize);

            urlFile.close();
        }
        else {
            char* content_buf = new char[headers_size + font_filesize + 1];

            memcpy(content_buf, headers_c_str, headers_size); //.size() leaves off null-termination in its count

            urlFile.read(content_buf + headers_size, font_filesize);

            content_buf[headers_size + font_filesize] = '\0';

            sendToClient(clientSocket, content_buf, headers_size + font_filesize);

            delete[] content_buf;
            urlFile.close();
        }      
    }
    else
    {
        std::cout << "This file was not opened successfully." << std::endl;
        return;
    }
        
}