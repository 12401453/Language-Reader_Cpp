#pragma once
#include "TcpListener.h"
#include <fstream>
#include <sqlite3.h>
#include <unicode/brkiter.h>
#include <unicode/unistr.h>
#include <unicode/regex.h>
#include "CurlFetcher.cpp"

class WebServer : public TcpListener {
public:
    WebServer(const char* ipAddress, int port, bool show_output) : TcpListener(ipAddress, port), m_DB_path{ "Kazakh.db" }, m_show_output{show_output}, m_dict_cookies{""} { 
        if(!m_show_output) std::cout.setstate(std::ios_base::failbit);
        //this setting of the sozdik.kz cookies should be moved to only run when the language is set to Kazakh, when I implement language-separation
        std::ifstream kaz_cookies_file;
        kaz_cookies_file.open("kaz_cookies.txt");
        if (kaz_cookies_file.good()) {
            std::getline(kaz_cookies_file, m_dict_cookies);
            kaz_cookies_file.close();
        }
        else {
            std::cout << "No kaz_cookies.txt file found\n";
        }
    }

protected:
    virtual void onClientConnected(SOCKET clientSocket);
    virtual void onClientDisconnected(SOCKET clientSocket);
    virtual void onMessageReceived(SOCKET clientSocket, const char* msg, int length);

private:
    int getRequestType(const char* msg);

    bool c_strStartsWith(const char* str1, const char* str2);
    int c_strFind(const char* haystack, const char* needle);
    int c_strFindNearest(const char* haystack, const char* needle1, const char* needle2);

    void buildGETContent(short int page_type, char* url_c_str, std::string& content, bool cookies_present);
    void insertTextSelect(std::ostringstream& html);
    void insertLangSelect(std::ostringstream &html);
    void sendBinaryFile(char* url_c_str, SOCKET clientSocket, const std::string &content_type);

    int checkHeaderEnd(const char* msg);
    void buildPOSTedData(const char* msg, bool headers_present, int length);
    void setURL(const char* msg);
    int getPostFields(const char* url);
    void handlePOSTedData(const char* post_data, SOCKET clientSocket);
    bool readCookie(std::string cookie[3], const char* msg);

    bool addText(std::string _POST[3], SOCKET clientSocket);
    bool addTextOldEnglish(std::string _POST[3], SOCKET clientSocket);
    bool lemmaTooltips(std::string _POST[2], SOCKET clientSocket);
    bool retrieveText(std::string text_id[1], SOCKET clientSocket);
    void void_retrieveText(std::string cookies[2], std::ostringstream &html);
    bool retrieveTextSplitup(std::string _POST[3], SOCKET clientSocket);
    bool retrieveEngword(std::string _POST[3], SOCKET clientSocket);
    bool recordLemma(std::string _POST[8], SOCKET clientSocket);
    bool deleteLemma(std::string _POST[3], SOCKET clientSocket);
    bool recordMultiword(std::string _POST[8], SOCKET clientSocket);
    bool deleteMultiword(std::string _POST[4], SOCKET clientSocket);
    bool updateMultiwordTranslations(std::string _POST[3], SOCKET clientSocket);
    bool deleteText(std::string _POST[1], SOCKET clientSocket);
    bool getLangId(std::string text_id[1], SOCKET clientSocket);
    bool retrieveMultiword(std::string _POST[3], SOCKET clientSocket);
    bool clearTable(SOCKET clientSocket);
    bool disregardWord(std::string _POST[2], SOCKET clientSocket);

    bool pullInLemma(std::string _POST[4], SOCKET clientSocket);
    bool retrieveMeanings(std::string _POST[2], SOCKET clientSocket);
    bool pullInMultiword(std::string _POST[2], SOCKET clientSocket);
    bool retrieveMultiwordMeanings(std::string _POST[2], SOCKET clientSocket);

    bool curlLookup(std::string _POST[1], SOCKET clientSocket);

    bool dumpLemmaTable(std::string _POST[1], SOCKET clientSocket);

    std::string URIDecode(std::string& text);
    std::string htmlspecialchars(const std::string& innerHTML);
    std::string escapeQuotes(const std::string& quoteystring);

    const char* m_post_data;
    std::string         m_post_data_incomplete;
    int                 m_total_post_bytes;
    int                 m_bytes_handled;
    bool                m_POST_continue;
    char                m_url[50]; //only applies to POST urls; you can crash the server by sending it a POST request with a >50 char url but not by having long-named GETted resource amongst the HTML_DOCS
    const char*         m_DB_path;
    std::string         m_cookies[3] {"1", "1", "1"};
    bool                m_show_output;

    std::string         m_dict_cookies;

};

