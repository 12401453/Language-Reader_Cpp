#pragma once
#include "TcpListener.h"
#include <sqlite3.h>
#include <unicode/brkiter.h>
#include <unicode/unistr.h>
#include <unicode/regex.h>

class WebServer : public TcpListener {
public:
    WebServer(const char* ipAddress, int port) : TcpListener(ipAddress, port), m_DB_path{ "Kazakh.db" } { }

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
    void sendFontFile(char* url_c_str, SOCKET clientSocket);

    int checkHeaderEnd(const char* msg);
    void buildPOSTedData(const char* msg, bool headers_present, int length);
    void setURL(const char* msg);
    int getPostFields(const char* url);
    void handlePOSTedData(const char* post_data, SOCKET clientSocket);
    bool setCookie(std::string cookie[2], const char* msg);

    bool addText(std::string _POST[3], SOCKET clientSocket);
    bool lemmaTooltips(std::string _POST[2], SOCKET clientSocket);
    bool retrieveText(std::string text_id[1], SOCKET clientSocket);
    void retrieveText(int cookie_textselect, std::ostringstream& html);
    bool retrieveTextSplitup(std::string _POST[3], SOCKET clientSocket);
    bool retrieveEngword(std::string _POST[3], SOCKET clientSocket);
    bool recordLemma(std::string _POST[8], SOCKET clientSocket);
    bool deleteLemma(std::string _POST[3], SOCKET clientSocket);
    bool deleteText(std::string _POST[1], SOCKET clientSocket);
    bool getLangId(std::string text_id[1], SOCKET clientSocket);

    bool pullInLemma(std::string _POST[4], SOCKET clientSocket);
    bool retrieveMeanings(std::string _POST[2], SOCKET clientSocket);

    std::string URIDecode(std::string& text);
    std::string htmlspecialchars(const std::string& innerHTML);
    std::string escapeQuotes(const std::string& quoteystring);

    const char* m_post_data;
    std::string         m_post_data_incomplete;
    int                 m_total_post_bytes;
    int                 m_bytes_handled;
    bool                m_POST_continue;
    char                m_url[50];
    const char*         m_DB_path;
    std::string         m_cookie[2];

};

