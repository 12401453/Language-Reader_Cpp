#include <iostream>
#include <string>
#include <sqlite3.h>

void replaceAll(std::string &source, const std::string yeeted, const std::string replacement) {
    
    size_t yeeted_length = yeeted.length();
    if(yeeted_length == 0) return;
    size_t replacement_length = replacement.length();

    std::string result;

    int search_pos = 0;
    int yeeted_pos = source.find(yeeted);
    while(yeeted_pos != std::string::npos) {
        source = source.replace(yeeted_pos, yeeted_length, replacement); 
        yeeted_pos = source.find(yeeted, yeeted_pos + replacement_length);
    }
}

void removeLengthMarks(std::string &long_vowel_text) {
    replaceAll(long_vowel_text, "ā", "a");
    replaceAll(long_vowel_text, "ē", "e");
    replaceAll(long_vowel_text, "ī", "i");
    replaceAll(long_vowel_text, "ū", "u");
    replaceAll(long_vowel_text, "ō", "o");
    replaceAll(long_vowel_text, "ȳ", "y");
}


int main() {
  sqlite3* DB;

  if(!sqlite3_open("Kazakh.db", &DB)) {

    sqlite3_exec(DB, "ALTER TABLE lemmas ADD COLUMN lemma_normalised TEXT", nullptr, nullptr, nullptr);

    sqlite3_exec(DB, "BEGIN IMMEDIATE", nullptr, nullptr, nullptr);

    sqlite3_stmt* select_stmt;
    const char* sql_select_txt = "SELECT lemma_id, lemma FROM lemmas WHERE lang_id = 11";
    sqlite3_prepare_v2(DB, sql_select_txt, -1, &select_stmt, NULL);
    
    sqlite3_stmt* update_stmt;
    const char* sql_update_txt = "UPDATE lemmas SET lemma_normalised = ? WHERE lemma_id = ?";
    sqlite3_prepare_v2(DB, sql_update_txt, -1, &update_stmt, NULL);

    
    while(sqlite3_step(select_stmt) == SQLITE_ROW) {

        int lemma_id = sqlite3_column_int(select_stmt, 0);
        std::string lemma_form = (const char*)sqlite3_column_text(select_stmt, 1);

        std::cout << lemma_form << " : ";
        removeLengthMarks(lemma_form);
        std::cout << lemma_form;
        sqlite3_bind_text(update_stmt, 1, lemma_form.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_int(update_stmt, 2, lemma_id);
        std::cout << " -- update result code: " << sqlite3_step(update_stmt) << "\n";

        sqlite3_reset(update_stmt);
        sqlite3_clear_bindings(update_stmt);

    }
    sqlite3_finalize(select_stmt);
    sqlite3_finalize(update_stmt);

    sqlite3_exec(DB, "COMMIT", nullptr, nullptr, nullptr);
    sqlite3_close(DB);
  }

  else {
    std::cout << "Problem opening database\n";
    return 0;
  }

}