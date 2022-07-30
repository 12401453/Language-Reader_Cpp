/* type '-lsqlite3' when compiling with g++ to include the sqlite3 library because the header file seems to just be forward declarations */
/* ICU library if installed on the system can be included with g++ sqlite.cpp -l sqlite3 `pkg-config --libs --cflags icu-uc icu-io` -o sqlite */

#include <iostream>
#include <fstream>
#include <sstream>
#include <string.h>
#include <sqlite3.h>
#include <unicode/unistr.h>
#include <unicode/regex.h>
#include <unicode/brkiter.h>

UErrorCode status = U_ZERO_ERROR;

int main() {

    sqlite3 *DB;
    sqlite3_stmt *statement;

    std::string sql_text_str;
    const char* sql_text;
    int prep_code, run_code;

    const char* text_word;
    int space;

    if (!sqlite3_open("Kazakh.db", &DB)){

        sql_text_str = "SELECT text_word, space, word_engine_id FROM display_text";
        //  std::cout << sql_text_str << std::endl;
        sql_text = sql_text_str.c_str();
        prep_code = sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
        
        
        
        while(sqlite3_step(statement) == SQLITE_ROW) {
            text_word = (const char*)sqlite3_column_text(statement, 0);
            if(!strcmp(text_word, "¬")) {
                text_word = "'";
            }
            if(!strcmp(text_word, "\n")) {
                text_word = "<br>";
            }
            space = sqlite3_column_int(statement, 1);
            if(sqlite3_column_int(statement, 2)) printf("__");
            if(space == 1) {
                printf("%s ", text_word);
            }
            else printf("%s", text_word);
        }
        sqlite3_finalize(statement);
        printf("\n");

        std::cout << sqlite3_close(DB) << std::endl;
    }

    return 0;

}
