#include <iostream>
#include <unordered_map>
#include <string>
#include <sqlite3.h>
#include <thread>

//compile: g++ -O3 -std=c++20 lang_extractor.cpp -lsqlite3 -o lang_extractor

class DatabaseExtractor {
    public:
        DatabaseExtractor(const std::string& _source_db_filepath, const std::string& _new_db_filepath, int _lang_id) {
            source_db_filepath = _source_db_filepath;
            new_db_filepath = _new_db_filepath;
            lang_id = _lang_id;
        }

        void initialiseDatabase();
        void rewriteDisplayText();
        void rewriteWordEngine();
        void rewriteLemmas();
        void rewriteMultiwordLemmas();
        void rewriteMultiwords();

        void extractAllTables() {
            initialiseDatabase();
            rewriteDisplayText();
            rewriteWordEngine();
            rewriteLemmas();
            rewriteMultiwordLemmas();
            rewriteMultiwords();
        }

    private:
        std::unordered_map<int, int> lemma_ids;
        std::unordered_map<int, int> word_eng_ids;
        std::unordered_map<int, int> multiword_ids;
        std::unordered_map<int, int> multiword_counts;

        int lang_id;
        std::string source_db_filepath;
        std::string new_db_filepath;

        void beginTransaction(sqlite3* database_connection) {
            sqlite3_exec(database_connection, "BEGIN IMMEDIATE", nullptr, nullptr, nullptr);
        };
        void commitTransaction(sqlite3* database_connection) {
            sqlite3_exec(database_connection, "COMMIT", nullptr, nullptr, nullptr);
        };
        
        //not needed because the maps are built up such that each new value is just the previous .size() + 1
        int getHighestMapValue(std::unordered_map<int, int> map) {
            int highest_so_far = 0;
            for(auto pair : map) {
                if(pair.second > highest_so_far) highest_so_far = pair.second;
            }
            return highest_so_far;
        };
};

void DatabaseExtractor::rewriteMultiwords() {
    sqlite3* source_DB;
    sqlite3* new_DB;

    if(!sqlite3_open(source_db_filepath.c_str(), &source_DB) && !sqlite3_open(new_db_filepath.c_str(), &new_DB)) {
        
        sqlite3_stmt* dump_multiwords_stmt;
        const char* dump_multiwords_sql = "SELECT multiword_id, word_eng_id1, word_eng_id2, word_eng_id3, word_eng_id4, word_eng_id5, word_eng_id6, word_eng_id7, word_eng_id8, word_eng_id9, word_eng_id10 FROM multiwords WHERE lang_id = ?";
        sqlite3_prepare_v2(source_DB, dump_multiwords_sql, -1, &dump_multiwords_stmt, NULL);
        sqlite3_bind_int(dump_multiwords_stmt, 1, lang_id);

        beginTransaction(new_DB);

        sqlite3_stmt* insert_multiword_stmt;
        const char* insert_multiword_sql = "INSERT INTO multiwords (multiword_id, word_eng_id1, word_eng_id2, word_eng_id3, word_eng_id4, word_eng_id5, word_eng_id6, word_eng_id7, word_eng_id8, word_eng_id9, word_eng_id10) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        sqlite3_prepare(new_DB, insert_multiword_sql, -1, &insert_multiword_stmt, NULL);

        while(sqlite3_step(dump_multiwords_stmt) == SQLITE_ROW) {

            int source_multiword_id = sqlite3_column_int(dump_multiwords_stmt, 0);
            
            int new_multiword_id = 0;
            if(source_multiword_id > 0 && multiword_ids.contains(source_multiword_id)) new_multiword_id = multiword_ids.at(source_multiword_id);
            else {
                new_multiword_id = multiword_ids.size() + 1;
                multiword_ids.emplace(source_multiword_id, new_multiword_id);
                std::cout << "new " << new_db_filepath << " pair added to multiword_ids map from the multiwords table: {" << source_multiword_id << "," << new_multiword_id << "}\n";
            }
            sqlite3_bind_int(insert_multiword_stmt, 1, new_multiword_id);

            for(int i = 2, x = 1; i < 12; i++, x++) {
                int source_word_eng_id = sqlite3_column_int(dump_multiwords_stmt, x);
                if(source_word_eng_id > 0) {    
                    int new_word_eng_id = 0;
                    if(word_eng_ids.contains(source_word_eng_id)) new_word_eng_id = word_eng_ids.at(source_word_eng_id);
                    else {
                        new_word_eng_id = word_eng_ids.size() + 1;
                        word_eng_ids.emplace(source_word_eng_id, new_word_eng_id);
                        std::cout << "new " << new_db_filepath << " pair added to word_eng_ids map from the multiwords table: {" << source_word_eng_id << "," << new_word_eng_id << "}\n";
                    }
                    sqlite3_bind_int(insert_multiword_stmt, i, new_word_eng_id);
                }
                else sqlite3_bind_int(insert_multiword_stmt, i, 0); //the multiwords table's word_eng_id fields are NOT NULL DEFAULT 0 for a reason I can't quite remember
            }

            sqlite3_step(insert_multiword_stmt);

            sqlite3_reset(insert_multiword_stmt);
            sqlite3_clear_bindings(insert_multiword_stmt);
        }
        sqlite3_finalize(insert_multiword_stmt);
        sqlite3_finalize(dump_multiwords_stmt);

        commitTransaction(new_DB);
        
        sqlite3_close(source_DB);
        sqlite3_close(new_DB);
    }
    else {
        std::cout << "Failed to open databases in rewriteMultiwords()\n";
    }
}

void DatabaseExtractor::rewriteMultiwordLemmas() {
    sqlite3* source_DB;
    sqlite3* new_DB;

    if(!sqlite3_open(source_db_filepath.c_str(), &source_DB) && !sqlite3_open(new_db_filepath.c_str(), &new_DB)) {

        sqlite3_stmt* dump_mw_lemmas_stmt;
        
        const char* dump_mw_lemmas_sql = "SELECT multiword_id, multiword_lemma_form, pos, eng_trans1, eng_trans2, eng_trans3, eng_trans4, eng_trans5 FROM multiword_lemmas WHERE lang_id = ?";
        sqlite3_prepare_v2(source_DB, dump_mw_lemmas_sql, -1, &dump_mw_lemmas_stmt, NULL);
        sqlite3_bind_int(dump_mw_lemmas_stmt, 1, lang_id);

        beginTransaction(new_DB);

        sqlite3_stmt* insert_mw_lemma_stmt;
        const char* insert_mw_lemma_sql = "INSERT INTO multiword_lemmas (multiword_id, multiword_lemma_form, pos, eng_trans1, eng_trans2, eng_trans3, eng_trans4, eng_trans5) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        sqlite3_prepare_v2(new_DB, insert_mw_lemma_sql, -1, &insert_mw_lemma_stmt, NULL);

        while(sqlite3_step(dump_mw_lemmas_stmt) == SQLITE_ROW) {

            int source_multiword_id = sqlite3_column_int(dump_mw_lemmas_stmt, 0);
            int new_multiword_id = 0;
            if(multiword_ids.contains(source_multiword_id)) new_multiword_id = multiword_ids.at(source_multiword_id);
            else {
                new_multiword_id = multiword_ids.size() + 1;
                multiword_ids.emplace(source_multiword_id, new_multiword_id);
                std::cout << "new " << new_db_filepath << " pair added to multiword_ids map from the multiword_lemmas table:: {" << source_multiword_id << "," << new_multiword_id << "}\n";
            }
            sqlite3_bind_int(insert_mw_lemma_stmt, 1, new_multiword_id);

            const char* multiword_lemma;
            const unsigned char* multiword_lemma_rawsql = sqlite3_column_text(dump_mw_lemmas_stmt, 1);
            if(multiword_lemma_rawsql != nullptr) {
                multiword_lemma = (const char*)multiword_lemma_rawsql;
                sqlite3_bind_text(insert_mw_lemma_stmt, 2, multiword_lemma, -1, SQLITE_STATIC); //Non-bound parameters default to NULL which in this case suits us so no need for an else
            }

            int pos = sqlite3_column_int(dump_mw_lemmas_stmt, 2);
            sqlite3_bind_int(insert_mw_lemma_stmt, 3, pos);

            for(int i = 3, x = 4; i < 8; i++, x++) {
                
                const unsigned char* eng_trans_rawsql = sqlite3_column_text(dump_mw_lemmas_stmt, i);
                if(eng_trans_rawsql != nullptr) {
                    const char* eng_trans = (const char*)eng_trans_rawsql; //for some reason using a std::string here can lead to nonsense-bytes in the DB even though std::cout shows no issues
                    //std::cout << eng_trans << "\n";
                    sqlite3_bind_text(insert_mw_lemma_stmt, x, eng_trans, -1, SQLITE_STATIC);
                }
            }

            sqlite3_step(insert_mw_lemma_stmt);

            sqlite3_reset(insert_mw_lemma_stmt);
            sqlite3_clear_bindings(insert_mw_lemma_stmt);          
        }
        sqlite3_finalize(insert_mw_lemma_stmt);
        sqlite3_finalize(dump_mw_lemmas_stmt);

        commitTransaction(new_DB);
    
        sqlite3_close(source_DB);
        sqlite3_close(new_DB);
    }
    else {
        std::cout << "Failed to open databases in rewriteMultiwordLemmas()\n";
    }
}

void DatabaseExtractor::rewriteLemmas() {
    sqlite3* source_DB;
    sqlite3* new_DB;

    if(!sqlite3_open(source_db_filepath.c_str(), &source_DB) && !sqlite3_open(new_db_filepath.c_str(), &new_DB)) {

        sqlite3_stmt* dump_lemmas_stmt;
        
        const char* dump_lemmas_sql = "SELECT lemma_id, lemma, pos, eng_trans1, eng_trans2, eng_trans3, eng_trans4, eng_trans5, eng_trans6, eng_trans7, eng_trans8, eng_trans9, eng_trans10, lemma_normalised FROM lemmas WHERE lang_id = ?";
        sqlite3_prepare_v2(source_DB, dump_lemmas_sql, -1, &dump_lemmas_stmt, NULL);
        sqlite3_bind_int(dump_lemmas_stmt, 1, lang_id);

        beginTransaction(new_DB);

        sqlite3_stmt* insert_lemma_stmt;
        const char* insert_lemma_sql = "INSERT INTO lemmas (lemma_id, lemma, pos, eng_trans1, eng_trans2, eng_trans3, eng_trans4, eng_trans5, eng_trans6, eng_trans7, eng_trans8, eng_trans9, eng_trans10, lemma_normalised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        sqlite3_prepare_v2(new_DB, insert_lemma_sql, -1, &insert_lemma_stmt, NULL);

        while(sqlite3_step(dump_lemmas_stmt) == SQLITE_ROW) {

            int source_lemma_id = sqlite3_column_int(dump_lemmas_stmt, 0);
            int new_lemma_id = 0;
            if(lemma_ids.contains(source_lemma_id)) new_lemma_id = lemma_ids.at(source_lemma_id);
            else {
                new_lemma_id = lemma_ids.size() + 1;
                lemma_ids.emplace(source_lemma_id, new_lemma_id);
                std::cout << "new " << new_db_filepath << " pair added to lemma_ids map from the lemmas table:: {" << source_lemma_id << "," << new_lemma_id << "}\n";
            }
            sqlite3_bind_int(insert_lemma_stmt, 1, new_lemma_id);

            const char* lemma;
            const unsigned char* lemma_rawsql = sqlite3_column_text(dump_lemmas_stmt, 1);
            if(lemma_rawsql != nullptr) {
                lemma = (const char*)lemma_rawsql;
                sqlite3_bind_text(insert_lemma_stmt, 2, lemma, -1, SQLITE_STATIC); //Non-bound parameters default to NULL which in this case suits us so no need for an else
            }

            int pos = sqlite3_column_int(dump_lemmas_stmt, 2);
            sqlite3_bind_int(insert_lemma_stmt, 3, pos);

            for(int i = 3, x = 4; i < 14; i++, x++) {
                
                const unsigned char* eng_trans_rawsql = sqlite3_column_text(dump_lemmas_stmt, i);
                if(eng_trans_rawsql != nullptr) {
                    const char* eng_trans = (const char*)eng_trans_rawsql; //for some reason using a std::string here can lead to nonsense-bytes in the DB even though std::cout shows no issues
                    //std::cout << eng_trans << "\n";
                    sqlite3_bind_text(insert_lemma_stmt, x, eng_trans, -1, SQLITE_STATIC);
                }
            }

            sqlite3_step(insert_lemma_stmt);

            sqlite3_reset(insert_lemma_stmt);
            sqlite3_clear_bindings(insert_lemma_stmt);          
        }
        sqlite3_finalize(insert_lemma_stmt);
        sqlite3_finalize(dump_lemmas_stmt);

        commitTransaction(new_DB);
    
        sqlite3_close(source_DB);
        sqlite3_close(new_DB);
    }
    else {
        std::cout << "Failed to open databases in rewriteLemmas()\n";
    }
}

void DatabaseExtractor::rewriteWordEngine() {
    sqlite3* source_DB;
    sqlite3* new_DB;

    if(!sqlite3_open(source_db_filepath.c_str(), &source_DB) && !sqlite3_open(new_db_filepath.c_str(), &new_DB)) {

        sqlite3_stmt* dump_word_eng_stmt;
        const char* dump_word_eng_sql = "SELECT word_engine_id, word, first_lemma_id FROM word_engine WHERE lang_id = ?";
        sqlite3_prepare_v2(source_DB, dump_word_eng_sql, -1, &dump_word_eng_stmt, NULL);
        sqlite3_bind_int(dump_word_eng_stmt, 1, lang_id);

        beginTransaction(new_DB);

        sqlite3_stmt* insert_new_word_eng_stmt;
        const char* insert_new_word_eng_sql = "INSERT INTO word_engine (word_engine_id, word, first_lemma_id) VALUES (?, ?, ?)"; //word has UNIQUE constraint so should really be OR IGNORE
        sqlite3_prepare_v2(new_DB, insert_new_word_eng_sql, -1, &insert_new_word_eng_stmt, NULL);

        while(sqlite3_step(dump_word_eng_stmt) == SQLITE_ROW) {
            
            int source_word_eng_id = sqlite3_column_int(dump_word_eng_stmt, 0);
             int new_word_eng_id = 0;
            if(word_eng_ids.contains(source_word_eng_id)) new_word_eng_id = word_eng_ids.at(source_word_eng_id);
            else {
                new_word_eng_id = word_eng_ids.size() + 1;
                word_eng_ids.emplace(source_word_eng_id, new_word_eng_id);
                //std::cout << "new " << new_db_filepath << " pair added to word_eng_ids map from the word_engine table:: {" << source_word_eng_id << "," << new_word_eng_id << "}\n";
            }

            const char* word;
            const unsigned char* word_rawsql = sqlite3_column_text(dump_word_eng_stmt, 1);
            if(word_rawsql != nullptr) word = (const char*)word_rawsql;
            else word = "NULLPTR";
            int source_first_lemma_id = sqlite3_column_int(dump_word_eng_stmt, 2);

            sqlite3_bind_int(insert_new_word_eng_stmt, 1, new_word_eng_id);
            sqlite3_bind_text(insert_new_word_eng_stmt, 2, word, -1, SQLITE_STATIC);
            if(source_first_lemma_id > 0) {
                //it's possible for a lemma_id to exist and be assigned as the default first_lemma_id in the word-engine table but not actually be explicitly assigned to a display_text word, because of the ability to delete lemmas off the display_text without deleting the lemma entirely
                if(lemma_ids.contains(source_first_lemma_id)) {
                    sqlite3_bind_int(insert_new_word_eng_stmt, 3, lemma_ids.at(source_first_lemma_id));
                }
                else {
                    int new_first_lemma_id = lemma_ids.size() + 1;
                    sqlite3_bind_int(insert_new_word_eng_stmt, 3, new_first_lemma_id);
                    lemma_ids.emplace(source_first_lemma_id, new_first_lemma_id);

                    //std::cout << "new " << new_db_filepath << " pair added to lemma_ids map from the word_engine table:: {" << source_first_lemma_id << "," << new_first_lemma_id << "}\n";
                }                
            }

            sqlite3_step(insert_new_word_eng_stmt);

            sqlite3_reset(insert_new_word_eng_stmt);
            sqlite3_clear_bindings(insert_new_word_eng_stmt);

        }
        sqlite3_finalize(insert_new_word_eng_stmt);
        sqlite3_finalize(dump_word_eng_stmt);

        commitTransaction(new_DB);

        sqlite3_close(source_DB);
        sqlite3_close(new_DB);
    }
    else {
        std::cout << "Failed to open databases in rewriteWordEngine()\n";
    }
}

void DatabaseExtractor::initialiseDatabase() {
    sqlite3* DB;

    if(!sqlite3_open(new_db_filepath.c_str(), &DB)) {

        const char* sql_BEGIN = "BEGIN IMMEDIATE";
        const char* sql_COMMIT = "COMMIT";

        const char* sql_createDisplayText = "DROP TABLE IF EXISTS display_text;CREATE TABLE display_text (tokno INTEGER PRIMARY KEY, text_word TEXT, space INTEGER, word_engine_id INTEGER, lemma_id INTEGER, lemma_meaning_no INTEGER, multiword_id INTEGER, multiword_meaning_no INTEGER, multiword_count INTEGER);CREATE INDEX mw_count_index ON display_text(multiword_count) WHERE multiword_count IS NOT NULL;CREATE INDEX lemma_id_index ON display_text(lemma_id) WHERE lemma_id IS NOT NULL;CREATE INDEX word_engine_id_index ON display_text(word_engine_id) WHERE word_engine_id IS NOT NULL";

        const char* sql_createWordEngine = "DROP TABLE IF EXISTS word_engine;CREATE TABLE word_engine (word_engine_id INTEGER PRIMARY KEY, word TEXT, first_lemma_id INTEGER, UNIQUE(word))";

        const char* sql_createTexts = "DROP TABLE IF EXISTS texts;CREATE TABLE texts (text_id INTEGER PRIMARY KEY, text_title TEXT, dt_start INTEGER, dt_end INTEGER, text_tag TEXT)";

        const char* sql_createLemmas = "DROP TABLE IF EXISTS lemmas;CREATE TABLE lemmas (lemma_id INTEGER PRIMARY KEY, lemma TEXT, eng_trans1 TEXT, eng_trans2 TEXT, eng_trans3 TEXT, eng_trans4 TEXT, eng_trans5 TEXT, eng_trans6 TEXT, eng_trans7 TEXT, eng_trans8 TEXT, eng_trans9 TEXT, eng_trans10 TEXT, pos INTEGER, lemma_normalised TEXT, UNIQUE(lemma, pos))";

        const char* sql_createMultiwordLemmas = "DROP TABLE IF EXISTS multiword_lemmas;CREATE TABLE multiword_lemmas (multiword_id INTEGER PRIMARY KEY, multiword_lemma_form TEXT, eng_trans1 TEXT, eng_trans2 TEXT, eng_trans3 TEXT, eng_trans4 TEXT, eng_trans5 TEXT, pos INTEGER, UNIQUE(multiword_lemma_form, pos))";

        const char* sql_createMultiwords = "DROP TABLE IF EXISTS multiwords;CREATE TABLE multiwords (multiword_id INTEGER, word_eng_id1 INTEGER DEFAULT 0 NOT NULL, word_eng_id2 INTEGER DEFAULT 0 NOT NULL, word_eng_id3 INTEGER DEFAULT 0 NOT NULL, word_eng_id4 INTEGER DEFAULT 0 NOT NULL, word_eng_id5 INTEGER DEFAULT 0 NOT NULL, word_eng_id6 INTEGER DEFAULT 0 NOT NULL, word_eng_id7 INTEGER DEFAULT 0 NOT NULL, word_eng_id8 INTEGER DEFAULT 0 NOT NULL, word_eng_id9 INTEGER DEFAULT 0 NOT NULL, word_eng_id10 INTEGER DEFAULT 0 NOT NULL, UNIQUE(multiword_id, word_eng_id1, word_eng_id2, word_eng_id3, word_eng_id4, word_eng_id5, word_eng_id6, word_eng_id7, word_eng_id8, word_eng_id9, word_eng_id10))";

        sqlite3_exec(DB, sql_BEGIN, nullptr, nullptr, nullptr);
        sqlite3_exec(DB, sql_createDisplayText, nullptr, nullptr, nullptr);
        sqlite3_exec(DB, sql_createWordEngine, nullptr, nullptr, nullptr);
        sqlite3_exec(DB, sql_createTexts, nullptr, nullptr, nullptr);
        sqlite3_exec(DB, sql_createLemmas, nullptr, nullptr, nullptr);
        sqlite3_exec(DB, sql_createMultiwordLemmas, nullptr, nullptr, nullptr);
        sqlite3_exec(DB, sql_createMultiwords, nullptr, nullptr, nullptr);
        sqlite3_exec(DB, sql_COMMIT, nullptr, nullptr, nullptr);
        
        sqlite3_close(DB);
    }
    else {
        std::cout << "Failed to open database in initialiseDatabase()\n";
    }
}


void DatabaseExtractor::rewriteDisplayText() {

    sqlite3* source_DB;
    sqlite3* new_DB;

    //std::cout << source_db_filepath << " " << new_db_filepath << " " << lang_id;

    if(!sqlite3_open(source_db_filepath.c_str(), &source_DB) && !sqlite3_open(new_db_filepath.c_str(), &new_DB)) {

        lemma_ids.reserve(2400);
        word_eng_ids.reserve(7000);
        multiword_ids.reserve(256);
        multiword_counts.reserve(512);

        int new_lemma_id = 1;
        int new_word_eng_id = 1;
        int new_multiword_id = 1;
        int new_multiword_count = 1;

        sqlite3_stmt* get_text_offsets_sql_stmt;
        
        const char* sql_BEGIN = "BEGIN IMMEDIATE";
        const char* sql_COMMIT = "COMMIT";

        sqlite3_exec(source_DB, sql_BEGIN, nullptr, nullptr, nullptr);

        const char* get_text_offsets_sql_text = "SELECT dt_start, dt_end, text_title FROM texts WHERE lang_id = ?";
        sqlite3_prepare_v2(source_DB, get_text_offsets_sql_text, -1, &get_text_offsets_sql_stmt, NULL);
        sqlite3_bind_int(get_text_offsets_sql_stmt, 1, lang_id);

        sqlite3_int64 dt_start = 0;
        sqlite3_int64 dt_end = 0;

        sqlite3_int64 new_dt_start = 1;

        while(sqlite3_step(get_text_offsets_sql_stmt) == SQLITE_ROW) {

            sqlite3_stmt* get_single_text_sql_stmt;
            sqlite3_stmt* write_display_text_stmt;
            sqlite3_stmt* insert_texts_table_stmt;

            dt_start = sqlite3_column_int64(get_text_offsets_sql_stmt, 0);
            dt_end = sqlite3_column_int64(get_text_offsets_sql_stmt, 1);
            const char* text_title;
            const unsigned char* text_title_rawsql = sqlite3_column_text(get_text_offsets_sql_stmt, 2);
            if(text_title_rawsql != nullptr) text_title = (const char*)text_title_rawsql;
            else text_title = "NULLPTR";

            const char* get_single_text_sql_text = "SELECT text_word, space, word_engine_id, lemma_id, lemma_meaning_no, multiword_id, multiword_meaning_no, multiword_count FROM display_text WHERE tokno >= ? AND tokno <= ?";
            sqlite3_prepare_v2(source_DB, get_single_text_sql_text, -1, &get_single_text_sql_stmt, NULL);
            sqlite3_bind_int64(get_single_text_sql_stmt, 1, dt_start);
            sqlite3_bind_int64(get_single_text_sql_stmt, 2, dt_end);

            int source_lemma_id = 0;
            int source_word_eng_id = 0;
            int source_multiword_id = 0;
            int source_multiword_count = 0;
            int space = 0;
            int lemma_meaning_no = 0;
            int multiword_meaning_no = 0;

            sqlite3_exec(new_DB, sql_BEGIN, nullptr, nullptr, nullptr);

            const char* sql_insert_txt = "INSERT INTO display_text (text_word, space, word_engine_id, lemma_id, lemma_meaning_no, multiword_id, multiword_meaning_no, multiword_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            //SQLite website says: "Unbound parameters are interpreted as NULL." so we should safely be able to execute the above statement without needing to conditionally call sqlite3_bind_null on parameters which are null in the source-database
            sqlite3_prepare_v2(new_DB, sql_insert_txt, -1, &write_display_text_stmt, NULL);

            while(sqlite3_step(get_single_text_sql_stmt) == SQLITE_ROW) {
                
                const char* text_word;
                const unsigned char* text_word_rawsql = sqlite3_column_text(get_single_text_sql_stmt, 0);
                if (text_word_rawsql != nullptr) text_word = (const char*)text_word_rawsql;
                else text_word = "NULLPTR";

                space = sqlite3_column_int(get_single_text_sql_stmt, 1);
                lemma_meaning_no = sqlite3_column_int(get_single_text_sql_stmt, 4);
                multiword_meaning_no = sqlite3_column_int(get_single_text_sql_stmt, 6);

                source_word_eng_id = sqlite3_column_int(get_single_text_sql_stmt, 2);
                source_lemma_id = sqlite3_column_int(get_single_text_sql_stmt, 3);
                source_multiword_id = sqlite3_column_int(get_single_text_sql_stmt, 5);
                source_multiword_count = sqlite3_column_int(get_single_text_sql_stmt, 7);

                sqlite3_bind_text(write_display_text_stmt, 1, text_word, -1, SQLITE_STATIC);
                if(space > 0) sqlite3_bind_int(write_display_text_stmt, 2, space);
                if(lemma_meaning_no > 0) sqlite3_bind_int(write_display_text_stmt, 5, lemma_meaning_no);
                if(multiword_meaning_no > 0) sqlite3_bind_int(write_display_text_stmt, 7, multiword_meaning_no);

                if(source_word_eng_id > 0) {
                    if(word_eng_ids.contains(source_word_eng_id)) {
                        sqlite3_bind_int(write_display_text_stmt, 3, word_eng_ids.at(source_word_eng_id));
                    }
                    else {
                        word_eng_ids.emplace(source_word_eng_id, new_word_eng_id);
                        sqlite3_bind_int(write_display_text_stmt, 3, new_word_eng_id);
                        new_word_eng_id++;
                    }
                }
                if(source_lemma_id > 0) {
                    if (lemma_ids.contains(source_lemma_id)) {
                        sqlite3_bind_int(write_display_text_stmt, 4, lemma_ids.at(source_lemma_id));
                    }
                    else {
                        lemma_ids.emplace(source_lemma_id, new_lemma_id);
                        sqlite3_bind_int(write_display_text_stmt, 4, new_lemma_id);
                        new_lemma_id++;
                    }
                }
                if (source_multiword_id > 0) {
                    if (multiword_ids.contains(source_multiword_id)) {
                        sqlite3_bind_int(write_display_text_stmt, 6, multiword_ids.at(source_multiword_id));
                    }
                    else {
                        multiword_ids.emplace(source_multiword_id, new_multiword_id);
                        sqlite3_bind_int(write_display_text_stmt, 6, new_multiword_id);
                        new_multiword_id++;
                    }
                }
                if(source_multiword_count > 0) {
                    if (multiword_counts.contains(source_multiword_count)) {
                        sqlite3_bind_int(write_display_text_stmt, 8, multiword_counts.at(source_multiword_count));
                    }
                    else {
                        multiword_counts.emplace(source_multiword_count, new_multiword_count);
                        sqlite3_bind_int(write_display_text_stmt, 8, new_multiword_count);
                        new_multiword_count++;
                    }
                }

                sqlite3_step(write_display_text_stmt);
                sqlite3_reset(write_display_text_stmt);
                sqlite3_clear_bindings(write_display_text_stmt);

            }
            sqlite3_int64 new_dt_end = sqlite3_last_insert_rowid(new_DB);
            
            const char* insert_texts_table = "INSERT INTO texts (text_title, dt_start, dt_end) VALUES (?, ?, ?)";
            sqlite3_prepare_v2(new_DB, insert_texts_table, -1, &insert_texts_table_stmt, NULL);
            sqlite3_bind_text(insert_texts_table_stmt, 1, text_title, -1, SQLITE_STATIC);
            sqlite3_bind_int64(insert_texts_table_stmt, 2, new_dt_start);  
            sqlite3_bind_int64(insert_texts_table_stmt, 3, new_dt_end);
            sqlite3_step(insert_texts_table_stmt);

            new_dt_start = new_dt_end + 1;

            sqlite3_finalize(insert_texts_table_stmt);
            sqlite3_finalize(write_display_text_stmt);
            sqlite3_finalize(get_single_text_sql_stmt);

            sqlite3_exec(new_DB, sql_COMMIT, nullptr, nullptr, nullptr);

        }
        sqlite3_finalize(get_text_offsets_sql_stmt);
        sqlite3_exec(source_DB, sql_COMMIT, nullptr, nullptr, nullptr);

        sqlite3_close(new_DB);
        sqlite3_close(source_DB);
    }
    else {
        std::cout << "Failed to open database in rewriteDisplayText\n";
    }
}

int main() {

    std::cout.setstate(std::ios_base::failbit);

    DatabaseExtractor OE_db_extractor = DatabaseExtractor("Kazakh.db", "Old_English.db", 10);
    DatabaseExtractor DK_db_extractor = DatabaseExtractor("Kazakh.db", "Danish.db", 8);
    DatabaseExtractor SV_db_extractor = DatabaseExtractor("Kazakh.db", "Swedish.db", 6);
    DatabaseExtractor KK_db_extractor = DatabaseExtractor("Kazakh.db", "Kazakh_sole.db", 2);
    DatabaseExtractor RU_db_extractor = DatabaseExtractor("Kazakh.db", "Russian.db", 1);
    DatabaseExtractor BG_db_extractor = DatabaseExtractor("Kazakh.db", "Bulgarian.db", 4);
    DatabaseExtractor PL_db_extractor = DatabaseExtractor("Kazakh.db", "Polish.db", 3);
    DatabaseExtractor DE_db_extractor = DatabaseExtractor("Kazakh.db", "German.db", 5);
    DatabaseExtractor TK_db_extractor = DatabaseExtractor("Kazakh.db", "Turkish.db", 7);
    DatabaseExtractor LA_db_extractor = DatabaseExtractor("Kazakh.db", "Latin.db", 11);
    DatabaseExtractor AZ_db_extractor = DatabaseExtractor("Kazakh.db", "Azerbaijani.db", 12);
    
    
    std::thread dk_thread ([&]() {
        DK_db_extractor.extractAllTables();
    });
    std::thread oe_thread([&]() {
        OE_db_extractor.extractAllTables();
    });
    std::thread sv_thread([&]() {
        SV_db_extractor.extractAllTables();  
    });
    std::thread kk_thread([&]() {
        KK_db_extractor.extractAllTables();
    });
    std::thread ru_thread([&]() {
        RU_db_extractor.extractAllTables();
    });
    std::thread bg_thread([&]() {
        BG_db_extractor.extractAllTables();
    });
    std::thread pl_thread([&]() {
        PL_db_extractor.extractAllTables();
    });
    std::thread de_thread([&]() {
        DE_db_extractor.extractAllTables();
    });
    std::thread tk_thread([&]() {
        TK_db_extractor.extractAllTables();
    });
    std::thread la_thread([&]() {
        LA_db_extractor.extractAllTables();
    });
    std::thread az_thread([&]() {
        AZ_db_extractor.extractAllTables();
    });

    oe_thread.join();
    sv_thread.join();
    kk_thread.join();
    ru_thread.join();
    pl_thread.join();
    bg_thread.join();
    de_thread.join();
    tk_thread.join();
    dk_thread.join();
    la_thread.join();
    az_thread.join();
    

    return 0;
}