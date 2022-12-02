/* type '-lsqlite3' when compiling with g++ to include the sqlite3 library because the header file seems to just be forward declarations */
/* ICU library if installed on the system can be included with g++ sqlite.cpp -l sqlite3 `pkg-config --libs --cflags icu-uc icu-io` -o sqlite */
#include <sstream>
#include <fstream>
#include "WebServer.h"
#include <math.h>
#include <iomanip> //REMOVE after testing



void WebServer::onClientConnected(int clientSocket) {

}

void  WebServer::onClientDisconnected(int clientSocket) { 
    
}

void WebServer::onMessageReceived(int clientSocket, const char* msg, int length) {


    #define GET 3
    #define POST 4
  
    m_POST_continue = true;

  
  
    int lb_pos = checkHeaderEnd(msg);
    int get_or_post = getRequestType(msg);
  
    std::cout << get_or_post << std::endl;

    if(get_or_post == -1 && lb_pos == -1) {
        buildPOSTedData(msg, false, length);

        if(m_POST_continue == false) {
            handlePOSTedData(m_post_data, clientSocket);
        }
    }

    else if (get_or_post == GET)
    {
        std::cout << "This is a GET request" << std::endl;

        std::cout << "lb_pos: " << lb_pos << std::endl;
        char msg_url[lb_pos - 12];
        std::cout << "size of msg_url array: " << sizeof(msg_url) << std::endl;

        for (int i = 4; i < lb_pos - 9; i++)
        {
            msg_url[i - 4] = msg[i];
            std::cout << msg[i];
        }
        std::cout << std::endl;
        msg_url[lb_pos - 13] = '\0';

        short int page_type = 0;
        if(!strcmp(msg_url, "/dk/text_viewer")) page_type = 1;
        else if(!strcmp(msg_url, "/dk/add_texts")) page_type = 2;

        #include "docRoot.cpp"
   
        int url_size = strlen(docRoot_c_str) + sizeof(msg_url); //sizeof() can be used for c-strings declared as an array of char's but strlen() must be used for char *pointers
        char url_c_str[url_size];
    
        strcpy(url_c_str, docRoot_c_str);
        strcat(url_c_str, msg_url);

        bool cookies_present = setCookie(m_cookie, msg);
        std::cout << "Cookies present? " << cookies_present << std::endl;
        if(cookies_present) {
            std::cout << "Cookie key: " << m_cookie[0] << "; Cookie value: " << m_cookie[1] << std::endl;
        }

        std::string content = "<h1>404 Not Found</h1>"; 

        buildGETContent(page_type, url_c_str, content, cookies_present);       

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
        oss << "HTTP/1.1 200 OK\r\n";
    //    oss << "Cache-Control: no-cache, private \r\n";
        oss << "Content-Type: " << content_type << "\r\n";
        oss << "Content-Length: " << content.size() << "\r\n";
        oss << "\r\n";
        oss << content;

        std::string output = oss.str();
        int size = output.size() + 1;

        sendToClient(clientSocket, output.c_str(), size);
    }
    else if(get_or_post == POST) {  

        std::cout << "This is a POST request" << std::endl;
        
       buildPOSTedData(msg, true, length);
       if(m_POST_continue == false) {
            handlePOSTedData(m_post_data, clientSocket);
       } 
    } 


    printf("\n--------------------------------------MESSAGE BEGIN--------------------------------------------------\n\n");
    printf("%s", msg);
    printf("\n-----------------------------------------------------------------------------------------------------\n");
    printf("Size of the above message is %i bytes\n\n", length);
    
}


bool WebServer::c_strStartsWith(const char *str1, const char *str2)
{
    int strcmp_count = 0;
    int str2_len = strlen(str2);
 
    int i = -1;
   
    while ((*str1 == *str2 || *str2 == '\0') && i < str2_len)
    {
        strcmp_count++;
        str1++;
        str2++;
        i++;
    }
 
    if (strcmp_count == str2_len + 1)
    {
        return true;
    }
    else
        return false;
}

int WebServer::c_strFind(const char* haystack, const char* needle) {

    int needle_startpos = 0;
    int needle_length = strlen(needle);
    int haystack_length = strlen(haystack);
    if(haystack_length < needle_length) return -1;
    char needle_buf[needle_length + 1];

    needle_buf[needle_length] = '\0';
    for(int i = 0; i < haystack_length; i++) {
        for(int j = 0 ; j < needle_length; j++) {
            needle_buf[j] = haystack[j];
        }
       
        if(c_strStartsWith(needle_buf, needle)) {
            break;
        }
        needle_startpos++;
        haystack++;
    }
    
    if(needle_startpos == haystack_length) {
        return -1;
        }
    else {
        return needle_startpos;
    } 
}

int WebServer::c_strFindNearest(const char* haystack, const char* needle1, const char* needle2) {
    int needles_startpos = 0;
    int needle1_length = strlen(needle1);
    int needle2_length = strlen(needle2);
    int longest_needle_length = needle1_length < needle2_length ? needle2_length : needle1_length;
    int haystack_length = strlen(haystack);
    if(haystack_length < longest_needle_length) return -1;

    char needles_buf[longest_needle_length + 1];
    needles_buf[longest_needle_length] = '\0';

    for(int i = 0; i < haystack_length; i++) {
        for(int j = 0; j < longest_needle_length; j++) {
            needles_buf[j] = haystack[j];
        }
        if(c_strStartsWith(needles_buf, needle1) || c_strStartsWith(needles_buf, needle2)) {
            break;
        }
        needles_startpos++;
        haystack++;
    }

    if(needles_startpos == haystack_length) {
        return -1;
    }
    else {
        return needles_startpos;
    }
}


int WebServer::getRequestType(const char* msg ) {

    if(c_strStartsWith(msg, "GET")) {
        return 3;
    }
    else if(c_strStartsWith(msg, "POST")) {
        return 4;
    }
    else return -1;
}

int WebServer::checkHeaderEnd(const char* msg) {
    int lb_pos = c_strFind(msg, "\x0d");
    int HTTP_line_pos = c_strFind(msg, "HTTP/1.1");
    if(HTTP_line_pos != -1 && HTTP_line_pos < lb_pos) return lb_pos;
    else return -1;
}

 void WebServer::buildGETContent(short int page_type, char* url_c_str, std::string &content, bool cookies_present) {
    
    std::ifstream urlFile;
    urlFile.open(url_c_str);
    
    if (urlFile.good())
    {
        std::cout << "This file exists and was opened successfully." << std::endl;

        std::ostringstream ss_text;
        std::string line;
        while (std::getline(urlFile, line))
        {   
            if(page_type > 0 && line.find("<?php") != -1) insertTextSelect(ss_text);
            else if(page_type == 1 && cookies_present && line.find("<?cky") != -1) retrieveText(std::stoi(m_cookie[1]), ss_text);
            else if(page_type == 1 && line.find("<?cky") != -1) ss_text << "<br><br>\n";
            else ss_text << line << '\n';
        }

        content = ss_text.str();

        urlFile.close();
    }
    else
    {
        std::cout << "This file was not opened successfully." << std::endl;
    }
        
}


void WebServer::insertTextSelect(std::ostringstream &html) {
    sqlite3* DB;
    sqlite3_stmt* statement;

    if(!sqlite3_open(m_DB_path, &DB)) {
        int prep_code, run_code;
        const char *sql_text;

        sql_text = "SELECT text_id, text_title FROM texts";
        prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);

        int text_id = 0;
        const char* text_title;
        std::string text_title_str;

        while(sqlite3_step(statement) == SQLITE_ROW) {
            text_id = sqlite3_column_int(statement, 0);
            text_title = (const char*)sqlite3_column_text(statement, 1);

            icu::UnicodeString unicode_text_title = text_title;
            unicode_text_title.findAndReplace("¬", "\'");
            unicode_text_title.toUTF8String(text_title_str);

            html << "<option value=\"" << text_id << "\">" << text_title_str << "</option>\n";
            text_title_str = "";
        }

        sqlite3_finalize(statement);
    
        sqlite3_close(DB); 
    }
}

void WebServer::buildPOSTedData(const char* msg, bool headers_present, int length) {

    if(headers_present) {

        setURL(msg);
        
        int content_length_start = c_strFind(msg, "Content-Length:") + 16;
        
        int cl_figures = 0;
        char next_nl;
        while(next_nl != '\x0d') {
            next_nl = msg[content_length_start + cl_figures];
            cl_figures++;
        }
        cl_figures--;
        printf("Number of digits in content-length: %i\n", cl_figures);

        char content_length_str[cl_figures + 1];
        for(int i = 0; i < cl_figures; i++) {
            content_length_str[i] = msg[content_length_start + i];
        }
        content_length_str[cl_figures] = '\0';
        int content_length = atoi(content_length_str);
        printf("Parsed-out content-length: %i\n", content_length);

        int headers_length = c_strFind(msg, "\r\n\r\n");
        m_POST_continue = false;
        m_bytes_handled = 0;
        m_total_post_bytes = headers_length + 4 + content_length;
        if(m_total_post_bytes > length) {
            std::string post_data {msg + headers_length + 4}; //strcat won't work unless I use malloc() to allocate heap-memory of appropriate size for the stuck-together c-strings, so may as well use std::string if I'm forced to heap-allocate anyway
            //at least I'm only heap-allocating in those instances where the POST data makes the message over 4096 bytes
           m_post_data_incomplete = post_data;
           // std::cout << "headers_length + 4 + content_length > length" << std::endl;
           m_POST_continue = true;
           m_bytes_handled += length;
            
        }
        else {
            m_post_data = msg + headers_length + 4;
        }
  
    }
    else {
        
        std::string post_data_cont {msg};
        m_post_data_incomplete += post_data_cont;
        m_post_data = m_post_data_incomplete.c_str();
        m_bytes_handled += length;
        if(m_total_post_bytes == m_bytes_handled) {
            m_POST_continue = false;
        }    
    }

}

std::string urlDecode(std::string &text) //stolen off a rando on stackexchange
{
    std::string escaped;

    for (auto i = text.begin(), nd = text.end(); i < nd; ++i)
    {
        auto c = (*i);

        switch (c)
        {
        case '%':
            if (i[1] && i[2])
            {
                char hs[]{i[1], i[2]};
                escaped += static_cast<char>(strtol(hs, nullptr, 16));
                i += 2;
            }
            break;
        case '+':
            escaped += ' ';
            break;
        default:
            escaped += c;
        }
    }

    return escaped;
}

//in order to avoid using std::vector I cannot save the array of the POSTed data into a variable which persists outside this function, because the size of the array is only known if I know which POST data I am processing, which means the code to create an array out of the m_post_data has to be repeated everytime a function to handle it is called
void WebServer::handlePOSTedData(const char* post_data, int clientSocket) {
    printf("------------------------COMPLETE POST DATA------------------------\n%s\n-------------------------------------------------------\n", post_data);
    
    int post_fields = getPostFields(m_url);

    int equals_positions_arr[post_fields];
    int equals_pos = 0;
    for(int i = 0; i < post_fields; i++) {
        equals_pos = c_strFind(post_data + equals_pos + 1, "=") + equals_pos + 1;
        if(equals_pos == -1) break;
        equals_positions_arr[i] = equals_pos;
        
    }

    int amp_positions_arr[post_fields];
    int amp_pos = 0;
   
  
    for(int i = 0; i < post_fields - 1; i++) {
        amp_pos = c_strFind(post_data + amp_pos + 1, "&") + amp_pos + 1;
        if (amp_pos == -1) break;
        amp_positions_arr[i] = amp_pos;
        
    }
    amp_positions_arr[post_fields -1] = strlen(post_data);
    

    for(int i = 0; i < post_fields; i++) {
        printf("equals position no. %i: %i\n", i, equals_positions_arr[i]);
    }
    for(int i = 0; i < post_fields - 1; i++) {
        printf("amp position no. %i: %i\n", i, amp_positions_arr[i]);
    }
    std::string post_values[post_fields];
    for(int i = 0; i < post_fields; i++) {
        char ith_post_value[amp_positions_arr[i] - equals_positions_arr[i] + 1];
        printf("length of post_value array: %i\n", amp_positions_arr[i] - equals_positions_arr[i] + 1);
        for(int j = 0; j < amp_positions_arr[i] - equals_positions_arr[i] - 1; j++) {
            ith_post_value[j] = post_data[equals_positions_arr[i] + 1 + j];
           // printf("j = %i, char = %c | ", j, post_data[equals_positions_arr[i] + 1 + j]);
        }
        ith_post_value[amp_positions_arr[i] - equals_positions_arr[i] - 1] = '\0';
        std::string ith_post_value_str {ith_post_value};
        //const char* ith_post_value_cnst = ith_post_value;

        post_values[i] = ith_post_value_str;
    }

    for (int i = 0; i < post_fields; i++)
    {
       std::cout << "POST value no." << i << ": " << post_values[i] << std::endl;
    }

    if(!strcmp(m_url, "/dk/update_db.php")) {
        bool php_func_success = addText(post_values, clientSocket);  
    }
    if(!strcmp(m_url, "/dk/lemma_tooltip.php")) {
        bool php_func_success = lemmaTooltips(post_values, clientSocket);
    }
    if(!strcmp(m_url, "/dk/retrieve_text.php")) {
        bool php_func_success = retrieveText(post_values, clientSocket);
    }
    if(!strcmp(m_url, "/dk/retrieve_text_splitup.php")) {
        bool php_func_success = retrieveTextSplitup(post_values, clientSocket);
    }
    if(!strcmp(m_url, "/dk/get_lang_id.php")) {
        bool php_func_success = getLangId(post_values, clientSocket);
    }
    if(!strcmp(m_url, "/dk/delete_text.php")) {
        bool php_func_success = deleteText(post_values, clientSocket);
    }

    printf("m_url: %s\n", m_url);
    
}

void WebServer::setURL(const char* msg) {
    int url_start = c_strFind(msg, "/");
  //  printf("url_start: %i\n", url_start);
    int url_end = c_strFind(msg + url_start, " ") + url_start;
  //  printf("url_end: %i\n", url_end);
    char url[url_end - url_start + 1];
    for (int i = 0; i < url_end - url_start; i++)
    {
        url[i] = msg[url_start + i];
    }
    url[url_end - url_start] = '\0';
    
    strcpy(m_url, url); //m_url is max 50 chars but this is allowed because I tightly control what the POST urls are; using std::string would be wasteful
}

int WebServer::getPostFields(const char* url) {
    if(!strcmp(url, "/dk/update_db.php")) return 3;
    else if(!strcmp(url, "/dk/lemma_tooltip.php")) return 2;
    else if(!strcmp(url, "/dk/retrieve_text.php")) return 1;
    else if(!strcmp(url, "/dk/retrieve_text_splitup.php")) return 3;
    else if(!strcmp(url, "/dk/get_lang_id.php")) return 1;
    else if(!strcmp(url, "/dk/pull_lemma.php")) return 4;
    else if(!strcmp(url, "/dk/lemma_record.php")) return 8;
    else if(!strcmp(url, "/dk/lemma_delete.php")) return 3;
    else if(!strcmp(url, "/dk/retrieve_engword.php")) return 3;
    else if(!strcmp(url, "/dk/retrieve_meanings.php")) return 2;
    else if(!strcmp(url, "/dk/delete_text.php")) return 1;
    else return 10;
}

bool WebServer::setCookie(std::string cookie[2], const char* msg) {
    int cookie_start = c_strFind(msg, "\r\nCookie") + 10;
    if(cookie_start == 9) return false; //c_strFind() returns -1 if unsuccessful, but I've just added 10 to it so the number signalling no cookies is 9
    int key_length = c_strFind(msg + cookie_start, "=");

    char key[key_length + 1];
    for(int i = 0; i < key_length; i++) {
        key[i] = (msg + cookie_start)[i];
    }
    key[key_length] = '\0';
    if(strcmp(key, "text_id")) {
        cookie[0] = "text_id";
        cookie[1] = "0";
        return true;
    }

    int val_length = c_strFindNearest(msg + cookie_start + key_length + 1, ";", "\r\n");

    char val[val_length + 1];
    for(int i = 0; i < val_length; i++) {
        val[i] = (msg + cookie_start + key_length + 1)[i];
    }
    val[val_length] = '\0';
    
    cookie[0] = key;
    cookie[1] = val;
    return true;
}

bool WebServer::addText(std::string _POST[3], int clientSocket) {
    std::cout << "update_db.php" << std::endl;
   
    UErrorCode status = U_ZERO_ERROR;
    std::string text_body = urlDecode(_POST[0]);

    sqlite3 *DB;
    sqlite3_stmt *statement;

    

    if(!sqlite3_open(m_DB_path, &DB)) {

     //   int count = 0;

        icu::BreakIterator *bi = icu::BreakIterator::createWordInstance(icu::Locale::getUS(), status);
        icu::UnicodeString regexp = "\\p{L}"; // from the ICU regex documentation: \p{UNICODE PROPERTY NAME}	Match any character having the specified Unicode Property. (L = letter). This will catch exactly the same things as what the BreakIterator views as word-boundaries, meaning words with thigns like the OCS abbreviation tilde which would get classified as non-words if we used \P{UNICODE PROPERTY NAME} (match characters NOT having the specified property). If the BreakIterator fucks up then this will fuck up, but in that case we were fucked anyway. possibly \w (match Unicode 'words') is better but that also matches numerals which I'm ambivalent about given there can be infinity numbers
        icu::RegexMatcher *matcher = new icu::RegexMatcher(regexp, 0, status); //call delete on this
        
        
        std::istringstream iss(text_body);

        int prep_code, run_code;
        const char *sql_commands[1];
        std::string sql_text_str;
        const char *sql_text;

        int lang_id = std::stoi(_POST[2]);

        
   
        sql_text = "SELECT MAX(tokno) FROM display_text";
        prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
        run_code = sqlite3_step(statement);
             
        int dt_start = sqlite3_column_int(statement, 0) + 1;
        sqlite3_finalize(statement);

        const char *sql_BEGIN = "BEGIN IMMEDIATE";
        const char *sql_COMMIT = "COMMIT";
              
        prep_code = sqlite3_prepare_v2(DB, sql_BEGIN, -1, &statement, NULL);
        run_code = sqlite3_step(statement);
        sqlite3_finalize(statement);

        

        for(std::string token; std::getline(iss, token, ' '); ) {
            icu::UnicodeString token_unicode = token.c_str();

            token_unicode.findAndReplace("'", "¬");
            token_unicode.findAndReplace("’", "¬");

            bi->setText(token_unicode);

            int32_t start_range, end_range;
            icu::UnicodeString tb_copy;
            std::string chunk;

            std::string text_word;

            int32_t p = bi->first();
            bool is_a_word = true;
           
            while(p != icu::BreakIterator::DONE) {
                tb_copy = token_unicode;
                start_range = p;
                p = bi->next();
                end_range = p;
                if(end_range == -1) break;
                tb_copy.retainBetween(start_range, end_range);
                
                matcher->reset(tb_copy); //tells the RegexMatcher object to use tb_copy as its haystack
                if(matcher->find()) {
                    is_a_word = true;
                }
                else {
                    is_a_word = false;
                }
                
                if(is_a_word) {          
                
                    tb_copy.toUTF8String(text_word);
                    if(_POST[2] == "7") {
                        tb_copy.toLower(icu::Locale("tr", "TR"));
                    }
                    else{
                        tb_copy.toLower();
                    }
                    
                    tb_copy.toUTF8String(chunk);

                    sql_text_str = "INSERT OR IGNORE INTO word_engine (word, lang_id) VALUES (\'"+chunk+"\', "+_POST[2]+")";
                    std::cout << sql_text_str << std::endl;
                    sql_text = sql_text_str.c_str();
                    sql_commands[0] = sql_text;

                    for (int i = 0; i < 1; i++) {
                        prep_code = sqlite3_prepare_v2(DB, sql_commands[i], -1, &statement, NULL);
                        run_code = sqlite3_step(statement);
                        sqlite3_finalize(statement);
                    //   std::cout << prep_code << std::endl;
                    //    std::cout << run_code << std::endl;
                    }

                    sql_text_str = "INSERT INTO display_text (word_engine_id, text_word) SELECT word_engine_id, \'"+text_word+"\' FROM word_engine WHERE word = \'"+chunk+"\' AND lang_id = "+_POST[2];
                    // std::cout << sql_text_str << std::endl;
                    sql_text = sql_text_str.c_str();
                    prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
                    run_code = sqlite3_step(statement);
                    sqlite3_finalize(statement); 
                }

                else {
                    tb_copy.toUTF8String(text_word);

                    sql_text_str = "INSERT INTO display_text (text_word) VALUES (\'"+text_word+"\')";
                    // std::cout << sql_text_str << std::endl;
                    sql_text = sql_text_str.c_str();
                    prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
                    run_code = sqlite3_step(statement);
                    sqlite3_finalize(statement);
                }
                chunk = ""; //toUTF8String appends the string in tb_copy to chunk rather than overwriting it
                text_word = "";
            }
            
            sql_text_str = "UPDATE display_text SET space = 1 WHERE tokno = last_insert_rowid()";
          //  std::cout << sql_text_str << std::endl;
            sql_text = sql_text_str.c_str();
            prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
            run_code = sqlite3_step(statement);
            sqlite3_finalize(statement);
        }

        delete bi;
        delete matcher;
        
        icu::UnicodeString unicode_text_title = urlDecode(_POST[1]).c_str();
        std::string text_title;
        unicode_text_title.findAndReplace("'", "¬");
        unicode_text_title.findAndReplace("’", "¬");
        unicode_text_title.toUTF8String(text_title);
        const char* text_title_c_str = text_title.c_str();
       

        sql_text = "INSERT INTO texts (text_title, dt_start, dt_end, lang_id) VALUES (?, ?, last_insert_rowid(), ?)";
        std::cout << "dt_start: " << dt_start << ", text_title: " << text_title << ", last_insert_row_id: " << sqlite3_last_insert_rowid(DB) << std::endl;

        prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
        sqlite3_bind_int(statement, 2, dt_start);
        sqlite3_bind_text(statement, 1, text_title_c_str, -1, SQLITE_STATIC);
        sqlite3_bind_int(statement, 3, lang_id);

        run_code = sqlite3_step(statement);
        std::cout << "Finalize code: " << sqlite3_finalize(statement) << std::endl;
        std::cout << prep_code << " " << run_code << std::endl;

      
        prep_code = sqlite3_prepare_v2(DB, sql_COMMIT, -1, &statement, NULL);
        run_code = sqlite3_step(statement);
        std::cout << prep_code << " " << run_code << std::endl;

        sqlite3_finalize(statement);

       

        std::cout << "sqlite_close: " << sqlite3_close(DB) << std::endl;
    }  
    std::string POST_response = "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: 0\r\n\r\n";
    int size = POST_response.size() + 1;

    sendToClient(clientSocket, POST_response.c_str(), size);
    return true;
}

bool WebServer::deleteText(std::string _POST[1], int clientSocket) {
    int text_id = std::stoi(_POST[0]);
    
    UErrorCode status = U_ZERO_ERROR;
    sqlite3* DB;
    sqlite3_stmt* statement;

    if(!sqlite3_open(m_DB_path, &DB)) {
    int prep_code, run_code;
    const char* sql_text;
    std::string sql_text_str;
    
    sql_text = "SELECT MAX(text_id) FROM texts";
    prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
    run_code = sqlite3_step(statement);
    int end_text_id = sqlite3_column_int(statement, 0);
    sqlite3_finalize(statement);

    bool end_text = (end_text_id == text_id);

   /* sql_text_str = "SELECT dt_start, dt_end FROM texts WHERE text_id = "+_POST[0];
    sql_text = sql_text_str.c_str(); */
    sql_text = "SELECT dt_start, dt_end FROM texts WHERE text_id = ?";
    prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
    sqlite3_bind_int(statement, 1, text_id);
    run_code = sqlite3_step(statement);
    std::cout << prep_code << " " << run_code << std::endl;

    int dt_start = sqlite3_column_int(statement, 0);
    int dt_end = sqlite3_column_int(statement, 1);
    sqlite3_finalize(statement);

    sql_text = "DELETE FROM display_text WHERE tokno >= ? AND tokno <= ?";
    prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
    sqlite3_bind_int(statement, 1, dt_start);
    sqlite3_bind_int(statement, 2, dt_end);
    run_code = sqlite3_step(statement);
    std::cout << prep_code << " " << run_code << std::endl;
    sqlite3_finalize(statement);

    sql_text = "DELETE FROM texts WHERE text_id = ?";
    prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
    sqlite3_bind_int(statement, 1, text_id);
    run_code = sqlite3_step(statement);
    std::cout << prep_code << " " << run_code << std::endl;
    sqlite3_finalize(statement);

    sqlite3_close(DB);
   
    std::cout << dt_start << "-->" << dt_end << std::endl;
    
    }

    std::string POST_response = "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: 0\r\nClear-Site-Data: \"cookies\"\r\n\r\n";
    int size = POST_response.size() + 1;

    sendToClient(clientSocket, POST_response.c_str(), size);
    return true;


}

bool WebServer::lemmaTooltips(std::string _POST[2], int clientSocket) {
    std::cout << "lemma_tooltip.php" << std::endl;
    
    return false;
}

bool WebServer::retrieveText(std::string text_id[1], int clientSocket) {

    int text_id_int = std::stoi(text_id[0]);
    std::cout << text_id << std::endl;

    if(text_id_int == 0) {
       std::ostringstream html;
       html << "<br><br>";

       std::string content_str = html.str();
       int content_length = content_str.size();

       std::ostringstream post_response_ss;
       post_response_ss << "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: " << content_length;
       post_response_ss << "\r\n" << "Set-Cookie: text_id=" << text_id[0];
       post_response_ss << "\r\n\r\n" << content_str;
       int length = post_response_ss.str().size() + 1;
       sendToClient(clientSocket, post_response_ss.str().c_str(), length);
       std::cout << "Sent text to client" << std::endl;
       return true;
    }

    UErrorCode status = U_ZERO_ERROR;
    sqlite3* DB;
    sqlite3_stmt* statement;

    std::ostringstream html;
   

    if(!sqlite3_open(m_DB_path, &DB)) {
    
    int prep_code, run_code;
    const char *sql_text;

    sql_text = "SELECT dt_start, dt_end, text_title FROM texts WHERE text_id = ?";
    prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
    std::cout << "bind code: " << sqlite3_bind_int(statement, 1, text_id_int) << std::endl;
    run_code = sqlite3_step(statement);

    std::cout << prep_code << " " << run_code << std::endl;

    int dt_start = sqlite3_column_int(statement, 0);
    int dt_end = sqlite3_column_int(statement, 1);

    html << "<h1 id=\"title\">" << sqlite3_column_text(statement, 2) << "</h1><br><div id=\"textbody\">&emsp;";
    sqlite3_finalize(statement);

    sql_text = "SELECT count(*) FROM display_text WHERE tokno >= ? AND tokno <= ? AND (space = 1 OR text_word = '\n')";
    prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
    sqlite3_bind_int(statement, 1, dt_start);
    sqlite3_bind_int(statement, 2, dt_end);
    run_code = sqlite3_step(statement);
    int chunk_total = sqlite3_column_int(statement, 0);
    sqlite3_finalize(statement);
    std::cout << "Total number of chunks in this text: " << chunk_total << std::endl;
    
    sql_text = "SELECT * FROM display_text WHERE tokno >= ? AND tokno <= ?";
    prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
    sqlite3_bind_int(statement, 1, dt_start);
    sqlite3_bind_int(statement, 2, dt_end);
    //run_code = sqlite3_step(statement);

    int chunk_count {1};
    float words_per_page {750};
    int tokno, space, word_engine_id, lemma_meaning_no, lemma_id;

    sqlite3_stmt* stmt;
    const char* sql_word_eng = "SELECT first_lemma_id FROM word_engine WHERE word_engine_id = ?";
    int first_lemma_id;
    const char* text_word;
    bool newline = false;
    bool following_a_space = true;

    while(sqlite3_step(statement) == SQLITE_ROW && chunk_count <= words_per_page) {
        tokno = sqlite3_column_int(statement, 0);
        space = sqlite3_column_int(statement, 2);
        word_engine_id = sqlite3_column_int(statement, 3);
        text_word = (const char*)sqlite3_column_text(statement, 1);

        newline = false;
        if(following_a_space) {
            html << "<span class=\"chunk\">";
        }

        if(word_engine_id) {
            lemma_id = sqlite3_column_int(statement, 5);
            lemma_meaning_no = sqlite3_column_int(statement, 4);

            sqlite3_prepare_v2(DB, sql_word_eng, -1, &stmt, NULL);
            sqlite3_bind_int(stmt, 1, word_engine_id);
            sqlite3_step(stmt);
            first_lemma_id = sqlite3_column_int(stmt, 0);
            sqlite3_finalize(stmt);

            if(lemma_id) {
                html << "<span class=\"tooltip lemma_set\" data-word_engine_id=\"" << word_engine_id << "\" data-tokno=\"" << tokno << "\">";
            }
            else {
                html << "<span class=\"tooltip\" data-word_engine_id=\"" << word_engine_id << "\" data-tokno=\"" << tokno << "\">";
            }
        }
        else {
            if(!strcmp(text_word, "¬")) {
                text_word = "'";
            }
            else if(!strcmp(text_word, "\n")) {
                text_word = "<br>";
                chunk_count++;
                newline = true;
            }
        }
        html << text_word;
        if(word_engine_id) {
            html << "</span>";
        }
        if(space == 1 || newline) {
            html << "</span>";
            following_a_space = true;
        }
        else following_a_space = false;
        if(space == 1) {
            html << " ";
            chunk_count++;
        }
            

    }
    html << "</div>";
    sqlite3_finalize(statement);
    

    if(chunk_total > words_per_page) {
        html << "<br><br><div id=\"pagenos\">";

        chunk_count = 1;
        int pagenos = (int)ceil(chunk_total/words_per_page);
        int page_toknos[pagenos];
        
        
        page_toknos[0] = dt_start;

        int arr_index = 1;

        sql_text = "SELECT tokno FROM display_text WHERE tokno >= ? AND tokno <= ? AND (space = 1 OR text_word = '\n')";
        prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
        sqlite3_bind_int(statement, 1, dt_start);
        sqlite3_bind_int(statement, 2, dt_end);

        while(sqlite3_step(statement) == SQLITE_ROW) {
          
            tokno = sqlite3_column_int(statement, 0);
            
            if(chunk_count % 750 == 0) {
                page_toknos[arr_index] = tokno + 1;
                std::cout << "arr_index: " << arr_index << std::endl;
                std::cout << "chunk_count: " << chunk_count << std::endl;
                arr_index++;
                
            }
            chunk_count++;
        }
        
        sqlite3_finalize(statement);

        for(int i = 0; i < pagenos; i++) {
            std::cout << "Page " << i + 1 << " starting tokno: " << page_toknos[i] << std::endl;
            html << "<span class=\"pageno\" onclick=\"selectText_splitup("<< page_toknos[i] << ", " << dt_end << ", " << i + 1 << ")\">" << i + 1 << "</span>";
        }
        html << "</div>";
    }
    else {
        html << "<br>";
    }

    sqlite3_close(DB); 

    std::string content_str = html.str();
    int content_length = content_str.size();

    std::ostringstream post_response_ss;
    post_response_ss << "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: " << content_length;
    post_response_ss << "\r\n" << "Set-Cookie: text_id=" << text_id[0];
    post_response_ss << "\r\n\r\n" << content_str;
    int length = post_response_ss.str().size() + 1;
    sendToClient(clientSocket, post_response_ss.str().c_str(), length);
    std::cout << "Sent text to client" << std::endl;
    return true;

    }
    else {       
        
        return false; 
    }
}

bool WebServer::retrieveTextSplitup(std::string _POST[3], int clientSocket) {
    UErrorCode status = U_ZERO_ERROR;
    sqlite3 *DB;
    sqlite3_stmt *statement;

    std::ostringstream html;

    if (!sqlite3_open(m_DB_path, &DB)) {

        int prep_code, run_code;
        const char *sql_text;

        int dt_start = std::stoi(_POST[0]);
        int dt_end = std::stoi(_POST[1]);
        int page_cur = std::stoi(_POST[2]);

        if(page_cur == 1) {
            html << "&emsp;";
        }

        sql_text = "SELECT * FROM display_text WHERE tokno >= ? AND tokno <= ?";
        prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
        sqlite3_bind_int(statement, 1, dt_start);
        sqlite3_bind_int(statement, 2, dt_end);
        // run_code = sqlite3_step(statement);

        int chunk_count{1};
        float words_per_page{750};
        int tokno, space, word_engine_id, lemma_meaning_no, lemma_id;

        sqlite3_stmt *stmt;
        const char *sql_word_eng = "SELECT first_lemma_id FROM word_engine WHERE word_engine_id = ?";
        int first_lemma_id;
        const char *text_word;

        bool newline = false;
        bool following_a_space = true;

        while(sqlite3_step(statement) == SQLITE_ROW && chunk_count <= words_per_page) {
            tokno = sqlite3_column_int(statement, 0);
            space = sqlite3_column_int(statement, 2);
            word_engine_id = sqlite3_column_int(statement, 3);
            text_word = (const char*)sqlite3_column_text(statement, 1);

            newline = false;
            if(following_a_space) {
                html << "<span class=\"chunk\">";
            }
            

            if(word_engine_id) {
                lemma_id = sqlite3_column_int(statement, 5);
                lemma_meaning_no = sqlite3_column_int(statement, 4);

                sqlite3_prepare_v2(DB, sql_word_eng, -1, &stmt, NULL);
                sqlite3_bind_int(stmt, 1, word_engine_id);
                sqlite3_step(stmt);
                first_lemma_id = sqlite3_column_int(stmt, 0);
                sqlite3_finalize(stmt);

                if(lemma_id) {
                    html << "<span class=\"tooltip lemma_set\" data-word_engine_id=\"" << word_engine_id << "\" data-tokno=\"" << tokno << "\">";
                }
                else {
                    html << "<span class=\"tooltip\" data-word_engine_id=\"" << word_engine_id << "\" data-tokno=\"" << tokno << "\">";
                }
            }
            else {
                if(!strcmp(text_word, "¬")) {
                    text_word = "'";
                }
                else if(!strcmp(text_word, "\n")) {
                    text_word = "<br>";
                    chunk_count++;
                    newline = true;
                }
            }
            html << text_word;
            if(word_engine_id) {
                html << "</span>";
            }
            if(space == 1 || newline) {
            html << "</span>";
            following_a_space = true;
            }
            else following_a_space = false;
            if(space == 1) {
                html << " ";
                chunk_count++;
            }
            

        }
        sqlite3_finalize(statement);
        sqlite3_close(DB);
        std::string content_str = html.str();
        int content_length = content_str.size();

        std::ostringstream post_response_ss;
        post_response_ss << "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: " << content_length << "\r\n\r\n" << content_str;
        int length = post_response_ss.str().size() + 1;
        sendToClient(clientSocket, post_response_ss.str().c_str(), length);
        std::cout << "Sent text to client" << std::endl;
        return true;
    }

    else return false;
    }

bool WebServer::getLangId(std::string text_id[1], int clientSocket) {

    UErrorCode status = U_ZERO_ERROR;
    sqlite3* DB;
    sqlite3_stmt* statement;
  

    if(!sqlite3_open(m_DB_path, &DB)) {
    
    int prep_code, run_code;
    
    std::string sql_text_str = "SELECT lang_id FROM texts WHERE text_id = "+text_id[0];
    const char* sql_text = sql_text_str.c_str();
    prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
    run_code = sqlite3_step(statement);
   
    int lang_id = sqlite3_column_int(statement, 0);
    sqlite3_finalize(statement);

    int content_length = lang_id > 9 ? 2 : 1;


    std::ostringstream html;
    html << "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: " << content_length << "\r\n\r\n" << lang_id;
    int length = html.str().size() + 1;

    sendToClient(clientSocket, html.str().c_str(), length);

    sqlite3_close(DB);
    return true;
    }
    else return false;
}

void WebServer::retrieveText(int cookie_textselect, std::ostringstream &html) {

    std::cout << cookie_textselect << std::endl;

    if(cookie_textselect == 0) {
        html << "<br><br>\n";
        return;
    }

    UErrorCode status = U_ZERO_ERROR;
    sqlite3* DB;
    sqlite3_stmt* statement;
   

    if(!sqlite3_open(m_DB_path, &DB)) {
    
        int prep_code, run_code;
        const char *sql_text;

        sql_text = "SELECT dt_start, dt_end, text_title FROM texts WHERE text_id = ?";
        prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
        std::cout << "bind code: " << sqlite3_bind_int(statement, 1, cookie_textselect) << std::endl;
        run_code = sqlite3_step(statement);

        std::cout << prep_code << " " << run_code << std::endl;

        int dt_start = sqlite3_column_int(statement, 0);
        //if the cookie refers to a deleted text then SQLite will convert the null given by this query of an empty row to 0, which is falsey in C++
        if(!dt_start) {
            html << "<br><br>\n";
            sqlite3_finalize(statement);
            sqlite3_close(DB);
            return;
        }
        int dt_end = sqlite3_column_int(statement, 1);
        
        html << "<h1 id=\"title\">" << sqlite3_column_text(statement, 2) << "</h1><br><div id=\"textbody\">&emsp;";
        sqlite3_finalize(statement);

        sql_text = "SELECT count(*) FROM display_text WHERE tokno >= ? AND tokno <= ? AND (space = 1 OR text_word = '\n')";
        prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
        sqlite3_bind_int(statement, 1, dt_start);
        sqlite3_bind_int(statement, 2, dt_end);
        run_code = sqlite3_step(statement);
        int chunk_total = sqlite3_column_int(statement, 0);
        sqlite3_finalize(statement);
        std::cout << "Total number of chunks in this text: " << chunk_total << std::endl;
        
        sql_text = "SELECT * FROM display_text WHERE tokno >= ? AND tokno <= ?";
        prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
        sqlite3_bind_int(statement, 1, dt_start);
        sqlite3_bind_int(statement, 2, dt_end);
        //run_code = sqlite3_step(statement);

        int chunk_count {1};
        float words_per_page {750};
        int tokno, space, word_engine_id, lemma_meaning_no, lemma_id;

        sqlite3_stmt* stmt;
        const char* sql_word_eng = "SELECT first_lemma_id FROM word_engine WHERE word_engine_id = ?";
        int first_lemma_id;
        const char* text_word;
        bool newline = false;
        bool following_a_space = true;

        while(sqlite3_step(statement) == SQLITE_ROW && chunk_count <= words_per_page) {
            tokno = sqlite3_column_int(statement, 0);
            space = sqlite3_column_int(statement, 2);
            word_engine_id = sqlite3_column_int(statement, 3);
            text_word = (const char*)sqlite3_column_text(statement, 1);

            newline = false;
            if(following_a_space) {
                html << "<span class=\"chunk\">";
            }

            if(word_engine_id) {
                lemma_id = sqlite3_column_int(statement, 5);
                lemma_meaning_no = sqlite3_column_int(statement, 4);

                sqlite3_prepare_v2(DB, sql_word_eng, -1, &stmt, NULL);
                sqlite3_bind_int(stmt, 1, word_engine_id);
                sqlite3_step(stmt);
                first_lemma_id = sqlite3_column_int(stmt, 0);
                sqlite3_finalize(stmt);

                if(lemma_id) {
                    html << "<span class=\"tooltip lemma_set\" data-word_engine_id=\"" << word_engine_id << "\" data-tokno=\"" << tokno << "\">";
                }
                else {
                    html << "<span class=\"tooltip\" data-word_engine_id=\"" << word_engine_id << "\" data-tokno=\"" << tokno << "\">";
                }
            }
            else {
                if(!strcmp(text_word, "¬")) {
                    text_word = "'";
                }
                else if(!strcmp(text_word, "\n")) {
                    text_word = "<br>";
                    chunk_count++;
                    newline = true;
                }
            }
            html << text_word;
            if(word_engine_id) {
                html << "</span>";
            }
            if(space == 1 || newline) {
                html << "</span>";
                following_a_space = true;
            }
            else following_a_space = false;
            if(space == 1) {
                html << " ";
                chunk_count++;
            }
                

        }
        html << "</div>";
        sqlite3_finalize(statement);
        

        if(chunk_total > words_per_page) {
            html << "<br><br><div id=\"pagenos\">";

            chunk_count = 1;
            int pagenos = (int)ceil(chunk_total/words_per_page);
            int page_toknos[pagenos];
            
            
            page_toknos[0] = dt_start;

            int arr_index = 1;

            sql_text = "SELECT tokno FROM display_text WHERE tokno >= ? AND tokno <= ? AND (space = 1 OR text_word = '\n')";
            prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
            sqlite3_bind_int(statement, 1, dt_start);
            sqlite3_bind_int(statement, 2, dt_end);

            while(sqlite3_step(statement) == SQLITE_ROW) {
            
                tokno = sqlite3_column_int(statement, 0);
                
                if(chunk_count % 750 == 0) {
                    page_toknos[arr_index] = tokno + 1;
                    std::cout << "arr_index: " << arr_index << std::endl;
                    std::cout << "chunk_count: " << chunk_count << std::endl;
                    arr_index++;
                    
                }
                chunk_count++;
            }
            
            sqlite3_finalize(statement);

            for(int i = 0; i < pagenos; i++) {
                std::cout << "Page " << i + 1 << " starting tokno: " << page_toknos[i] << std::endl;
                html << "<span class=\"pageno\" onclick=\"selectText_splitup("<< page_toknos[i] << ", " << dt_end << ", " << i + 1 << ")\">" << i + 1 << "</span>";
            }
            html << "</div>";
        }
        else {
            html << "<br>";
        }

        sqlite3_close(DB); 

    }
    else {       
        
        html << "Database connection failed<br><br>\n";
    }
}