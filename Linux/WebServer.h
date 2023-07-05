#include "TcpListener.h"
#include <fstream>
#include <sqlite3.h>
#include <unicode/unistr.h>
#include <unicode/regex.h>
#include <unicode/brkiter.h>
#include "CurlFetcher.cpp"

class WebServer : public TcpListener {
    public:
        WebServer(const char *ipAddress, int port, bool show_output) : TcpListener(ipAddress, port), m_DB_path{"Kazakh.db"}, m_show_output{show_output} {
            if(!m_show_output) std::cout.setstate(std::ios_base::failbit);
            m_kaz_dict_cookies = "";
            //this setting of the sozdik.kz cookies should be moved to only run when the language is set to Kazakh, when I implement language-separation
            std::ifstream kaz_cookies_file;
            kaz_cookies_file.open("kaz_cookies.txt");
            if (kaz_cookies_file.good()) {
                std::getline(kaz_cookies_file, m_kaz_dict_cookies);
                kaz_cookies_file.close();
            }
            else {
                std::cout << "No kaz_cookies.txt file found\n";
            }
        }

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
        void insertLangSelect(std::ostringstream &html);
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
        bool retrieveEngword(std::string _POST[3], int clientSocket);
        bool recordLemma(std::string _POST[8], int clientSocket);
        bool deleteLemma(std::string _POST[3], int clientSocket);
        bool recordMultiword(std::string _POST[8], int clientSocket);
        bool deleteMultiword(std::string _POST[4], int clientSocket);
        bool updateMultiwordTranslations(std::string _POST[3], int clientSocket);
        bool deleteText(std::string _POST[1], int clientSocket);
        bool getLangId(std::string text_id[1], int clientSocket);
        bool retrieveMultiword(std::string _POST[3], int clientSocket);
        bool clearTable(int clientSocket);

        bool pullInLemma(std::string _POST[4], int clientSocket);
        bool retrieveMeanings(std::string _POST[2], int clientSocket);
        bool pullInMultiword(std::string _POST[2], int clientSocket);
        bool retrieveMultiwordMeanings(std::string _POST[2], int clientSocket);

        bool curlLookup(std::string _POST[1], int clientSocket);
        bool curlLookup_sozdik(std::string _POST[1], int clientSocket);

        std::string URIDecode(std::string &text);
        std::string htmlspecialchars(const std::string &innerHTML);
        std::string escapeQuotes(const std::string &quoteystring);

        const char*         m_post_data;
        std::string         m_post_data_incomplete;
        int                 m_total_post_bytes;
        int                 m_bytes_handled;
        bool                m_POST_continue;
        char                m_url[50];
        const char*         m_DB_path;
        std::string         m_cookie[2];
        bool                m_show_output;

        std::string         m_kaz_dict_cookies;

};