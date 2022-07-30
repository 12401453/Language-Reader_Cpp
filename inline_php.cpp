#include <sstream>
#include <fstream>
#include "WebServer.h"


std::string phpLangSelect() {

    UErrorCode status = U_ZERO_ERROR;
    sqlite3* DB;
    sqlite3_stmt* statement;

    std::string html;

    if(!sqlite3_open("Kazakh.db", &DB)) {
        int prep_code, run_code;
        const char *sql_text;

        sql_text = "SELECT lang_id, lang_name FROM languages";
        prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
        while(sqlite3_step(statement) == SQLITE_ROW) {
            html += "<option value=\""+std::to_string(sqlite3_column_int(statement, 0))+"\">";
            std::string lang_name_str{(const char*)sqlite3_column_text(statement, 1)};
            html += lang_name_str+"</option>";
        }
        sqlite3_finalize(statement);
        sqlite3_close(DB);

        return html;
    
    }
    else return "Error opening DB";
}

std::ostringstream phpLangSelect_ss() {

    UErrorCode status = U_ZERO_ERROR;
    sqlite3* DB;
    sqlite3_stmt* statement;

    std::ostringstream html;

    if(!sqlite3_open("Kazakh.db", &DB)) {
        int prep_code, run_code;
        const char *sql_text;

        sql_text = "SELECT lang_id, lang_name FROM languages";
        prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
        while(sqlite3_step(statement) == SQLITE_ROW) {
            html << "<option value=\"" << sqlite3_column_int(statement, 0) << "\">";
            html << sqlite3_column_text(statement, 1) << "</option>";
        }
        sqlite3_finalize(statement);
        sqlite3_close(DB);

        return html;
    
    }
    else {
        std::ostringstream oss;
        return oss;
    }
}

std::string phpTextSelect() {

    UErrorCode status = U_ZERO_ERROR;
    sqlite3* DB;
    sqlite3_stmt* statement;

    std::string html;
    std::string text_title_str;

    if(!sqlite3_open("Kazakh.db", &DB)) {
        int prep_code, run_code;
        const char *sql_text;

        sql_text = "SELECT text_id, text_title FROM texts";
        prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
        while(sqlite3_step(statement) == SQLITE_ROW) {
            html += "<option value=\""+std::to_string(sqlite3_column_int(statement, 0))+"\">";
            icu::UnicodeString text_title_unicode{(const char*)sqlite3_column_text(statement, 1)};
            text_title_unicode.findAndReplace("¬", "'");
            text_title_unicode.toUTF8String(text_title_str);
            
            html += text_title_str+"</option>";
            text_title_str = "";
        }
        sqlite3_finalize(statement);
        sqlite3_close(DB);

        return html;
    
    }
    else return "Error opening DB";
}


std::ostringstream retrieveText(std::string text_id[1]) {

    std::cout << std::stoi(text_id[0]) << std::endl;

    UErrorCode status = U_ZERO_ERROR;
    sqlite3* DB;
    sqlite3_stmt* statement;

    std::ostringstream html;

    if(!sqlite3_open("Kazakh.db", &DB)) {
    
    int prep_code, run_code;
    const char *sql_text;

    sql_text = "SELECT dt_start, dt_end, text_title FROM texts WHERE text_id = ?";
    prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
    std::cout << "bind code: " << sqlite3_bind_int(statement, 1, std::stoi(text_id[0])) << std::endl;
    run_code = sqlite3_step(statement);

    std::cout << prep_code << " " << run_code << std::endl;

    int dt_start = sqlite3_column_int(statement, 0);
    int dt_end = sqlite3_column_int(statement, 1);

    html << "<h1 id=\"title\">" << sqlite3_column_text(statement, 2) << "</h1><br><div id=\"textbody\">&emsp;";
    sqlite3_finalize(statement);
    
    sql_text = "SELECT * FROM display_text WHERE tokno >= ? AND tokno <= ?";
    prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
    sqlite3_bind_int(statement, 1, dt_start);
    sqlite3_bind_int(statement, 2, dt_end);
    //run_code = sqlite3_step(statement);

    int chunk_count {0};
    int words_per_page {750};
    int tokno, space, word_engine_id, lemma_meaning_no, lemma_id;

    sqlite3_stmt* stmt;
    const char* sql_word_eng = "SELECT first_lemma_id FROM word_engine WHERE word_engine_id = ?";
    int first_lemma_id;
    const char* text_word;


    while(sqlite3_step(statement) == SQLITE_ROW) {
        tokno = sqlite3_column_int(statement, 0);
        space = sqlite3_column_int(statement, 2);
        word_engine_id = sqlite3_column_int(statement, 3);
        text_word = (const char*)sqlite3_column_text(statement, 1);
        

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
            }
        }
        html << text_word;
        if(word_engine_id) {
            html << "</span>";
        }
        if(space == 1) {
            html << " ";
        }
            

    }
    html << "</div>";
    sqlite3_finalize(statement);
    sqlite3_close(DB);

    return html;

    }
    else {       
        std::ostringstream oss;
        return oss; 
        }
}






int main() {
    //std::cout << phpLangSelect() << std::endl << std::endl;
   // std::cout << phpTextSelect() << std::endl << std::endl;
    //std::cout << phpLangSelect_ss().str() << std::endl;

    std::string text_id[1];
    std::cin >> text_id[0];

    std::cout << retrieveText(text_id).str() << std::endl;

    return 0;
}