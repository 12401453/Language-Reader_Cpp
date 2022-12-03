#include "TcpListener.h"
#include <sqlite3.h>
#include <unicode/unistr.h>
#include <unicode/regex.h>
#include <unicode/brkiter.h>

class WebServer : public TcpListener {
    public:
        WebServer(const char *ipAddress, int port) : TcpListener(ipAddress, port), m_DB_path{"/home/joe/Programs/networking/Kazakh_CPP/Kazakh.db"} { }

    protected:
        virtual void onClientConnected(int clientSocket);
        virtual void onClientDisconnected(int clientSocket);
        virtual void onMessageReceived(int clientSocket, const char *msg, int length);

    private:
        int getRequestType(const char* msg);     
        
        bool c_strStartsWith(const char* str1, const char* str2);
        int c_strFind(const char* haystack, const char* needle);

        int c_strFindNearest(const char* haystack, const char* needle1, const char* needle2);

        void buildGETContent(short int page_type, char* url_c_str, std::string &content, bool cookies_present);
        void insertTextSelect(std::ostringstream &html);
        void sendFontFile(char* url_c_str, int clientSocket);
        
        int checkHeaderEnd(const char* msg);
        void buildPOSTedData(const char* msg, bool headers_present, int length);
        void setURL(const char* msg);
        int getPostFields(const char* url);
        void handlePOSTedData(const char* post_data, int clientSocket);
        bool setCookie(std::string cookie[2], const char* msg);

        bool addText(std::string _POST[3], int clientSocket);
        bool lemmaTooltips(std::string _POST[2], int clientSocket);
        bool retrieveText(std::string text_id[1], int clientSocket);
        void retrieveText(int cookie_textselect, std::ostringstream &html);

        bool retrieveTextSplitup(std::string _POST[3], int clientSocket);
        bool deleteText(std::string _POST[1], int clientSocket);
        bool getLangId(std::string text_id[1], int clientSocket);

        std::string URIDecode(std::string &text);

        const char*         m_post_data;
        std::string         m_post_data_incomplete;
        int                 m_total_post_bytes;
        int                 m_bytes_handled;
        bool                m_POST_continue;
        char                m_url[50];
        const char*         m_DB_path;
        std::string         m_cookie[2];

};
