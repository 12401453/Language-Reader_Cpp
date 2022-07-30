/* type '-lsqlite3' when compiling with g++ to include the sqlite3 library because the header file seems to just be forward declarations */
/* ICU library if installed on the system can be included with g++ sqlite.cpp -l sqlite3 `pkg-config --libs --cflags icu-uc icu-io` -o sqlite */

#include <iostream>
#include <fstream>
#include <sstream>
#include <sqlite3.h>
#include <unicode/unistr.h>
#include <unicode/regex.h>
#include <unicode/brkiter.h>

UErrorCode status = U_ZERO_ERROR;

void createTables()
{
    sqlite3 *DB;
    sqlite3_stmt *statement;
    const char *sql_commands[13];
    // int exit_code = sqlite3_open("test.db", &DB);
    // the sqlite3_open() function returns 0 on success which is false in C++
    if (!sqlite3_open("Kazakh.db", &DB))
    {

        const char *sql_text = "DROP TABLE IF EXISTS display_text";
        sql_commands[0] = sql_text;
        sql_text = "CREATE TABLE display_text (tokno INTEGER PRIMARY KEY, text_word TEXT, space INTEGER, word_engine_id INTEGER, lemma_meaning_no INTEGER, lemma_id INTEGER)";
        sql_commands[1] = sql_text;
        sql_text = "DROP TABLE IF EXISTS chunks";
        sql_commands[2] = sql_text;
        sql_text = "CREATE TABLE chunks (dt_start INTEGER, dt_end INTEGER)";
        sql_commands[3] = sql_text;
        sql_text = "DROP TABLE IF EXISTS word_engine";
        sql_commands[4] = sql_text;
        sql_text = "CREATE TABLE word_engine (word_engine_id INTEGER PRIMARY KEY, word TEXT, lang_id INTEGER, first_lemma_id INTEGER, UNIQUE(word, lang_id))";
        sql_commands[5] = sql_text;
        sql_text = "DROP TABLE IF EXISTS lemmas";
        sql_commands[6] = sql_text;
        sql_text = "CREATE TABLE lemmas (lemma_id INTEGER PRIMARY KEY, lemma TEXT, eng_trans1 TEXT, eng_trans2 TEXT, eng_trans3 TEXT, eng_trans4 TEXT, eng_trans5 TEXT, eng_trans6 TEXT, eng_trans7 TEXT, eng_trans8 TEXT, eng_trans9 TEXT, eng_trans10 TEXT, lang_id INTEGER, pos INTEGER, UNIQUE(lemma, lang_id, pos))";
        sql_commands[7] = sql_text;
        sql_text = "DROP TABLE IF EXISTS languages";
        sql_commands[8] = sql_text;
        sql_text = "CREATE TABLE languages (lang_id INTEGER PRIMARY KEY, lang_name TEXT UNIQUE)";
        sql_commands[9] = sql_text;
        sql_text = "DROP TABLE IF EXISTS texts";
        sql_commands[10] = sql_text;
        sql_text = "CREATE TABLE texts (text_id  INTEGER PRIMARY KEY, text_title TEXT, dt_start INTEGER, dt_end INTEGER, lang_id INTEGER, text_tag TEXT)";
        sql_commands[11] = sql_text;

        sql_text = "INSERT INTO languages (lang_id, lang_name) VALUES (8, 'Danish'), (7, 'Turkish'), (1, 'Russian'), (2, 'Kazakh'), (3, 'Polish'), (4, 'Bulgarian')";
        sql_commands[12] = sql_text;

        int prep_code, run_code;

        const char *sql_BEGIN = "BEGIN TRANSACTION";
        prep_code = sqlite3_prepare_v2(DB, sql_BEGIN, -1, &statement, NULL);
        run_code = sqlite3_step(statement);
        for (int i = 0; i < 13; i++)
        {
            prep_code = sqlite3_prepare_v2(DB, sql_commands[i], -1, &statement, NULL);
            run_code = sqlite3_step(statement);
            std::cout << prep_code << std::endl;
            std::cout << run_code << std::endl;
        }
        const char *sql_COMMIT = "COMMIT";
        prep_code = sqlite3_prepare_v2(DB, sql_COMMIT, -1, &statement, NULL);
        run_code = sqlite3_step(statement);

        sqlite3_close(DB);
        return;
    }
    else
    {
        std::cout << "Error opening database" << std::endl;
        return;
    }
}

int main() {
    createTables();
    return 0;
}
