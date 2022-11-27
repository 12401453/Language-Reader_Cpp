#include <sqlite3.h>
#include <iostream>
#include <string>
#include <string.h>
#include <sstream>
#include <unicode/unistr.h>

int main() {
    sqlite3* DB;
    sqlite3_stmt* statement;

    std::ostringstream html;

    if(!sqlite3_open("Kazakh.db", &DB)) {
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
    std::cout << html.str();
    return 0;
}
    
