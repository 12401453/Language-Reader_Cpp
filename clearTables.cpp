
bool clearTables(int clientSocket,


sql_text = "DROP TABLE IF EXISTS display_text";

sql_text ="CREATE TABLE display_text (tokno INTEGER PRIMARY KEY, text_word TEXT, space INTEGER, word_engine_id INTEGER, lemma_meaning_no INTEGER, lemma_id INTEGER)";


sql_text = "DROP TABLE IF EXISTS chunks";

sql_text = "CREATE TABLE chunks (dt_start INTEGER, dt_end INTEGER)";


sql_text = "DROP TABLE IF EXISTS word_engine";

sql_text ="CREATE TABLE word_engine (word_engine_id INTEGER PRIMARY KEY, word TEXT, lang_id INTEGER, first_lemma_id INTEGER, UNIQUE(word, lang_id))";


sql_text = "DROP TABLE IF EXISTS texts";

sql_text = "CREATE TABLE texts (text_id INTEGER PRIMARY KEY, text_title TEXT, dt_start INTEGER, dt_end INTEGER, lang_id INTEGER, text_tag TEXT)";


sql_text = "DROP TABLE IF EXISTS lemmas";

sql_text = "CREATE TABLE lemmas (lemma_id INTEGER PRIMARY KEY, lemma TEXT, eng_trans1 TEXT, eng_trans2 TEXT, eng_trans3 TEXT, eng_trans4 TEXT, eng_trans5 TEXT, eng_trans6 TEXT, eng_trans7 TEXT, eng_trans8 TEXT, eng_trans9 TEXT, eng_trans10 TEXT, lang_id INTEGER, pos INTEGER, UNIQUE(lemma, lang_id, pos))";


sql_text = "DROP TABLE IF EXISTS multiword_index";

sql_text = "CREATE TABLE multiword_index (multiword_id INTEGER, dt_start INTEGER, dt_end INTEGER, UNIQUE(dt_start, dt_end))";


sql_text = "DROP TABLE IF EXISTS multiwords";

sql_text = "CREATE TABLE multiwords (multiword_id INTEGER PRIMARY KEY, word_engine_id1 INTEGER, word_engine_id2 INTEGER, word_engine_id3 INTEGER, word_engine_id4 INTEGER, word_engine_id5 INTEGER, word_engine_id6 INTEGER, word_engine_id7 INTEGER, word_engine_id8 INTEGER, word_engine_id9 INTEGER, word_engine_id10 INTEGER, eng_trans1 TEXT, eng_trans2 TEXT, eng_trans3 TEXT, eng_trans4 TEXT, eng_trans5 TEXT, lang_id INTEGER, UNIQUE(lang_id, word_engine_id1, word_engine_id2, word_engine_id3, word_engine_id4, word_engine_id5, word_engine_id6, word_engine_id7, word_engine_id8, word_engine_id9, word_engine_id10))";


sql_text = "DROP TABLE IF EXISTS languages";

sql_text = "CREATE TABLE languages (lang_id INTEGER PRIMARY KEY, lang_name TEXT UNIQUE)";


sql_text = "DROP TABLE IF EXISTS context_trans";

sql_text = "CREATE TABLE context_trans (dt_start INTEGER, dt_end INTEGER, eng_trans TEXT, UNIQUE(dt_start, dt_end))";



sql_text = "INSERT INTO languages (lang_id, lang_name) VALUES (8, 'Danish'), (7, 'Turkish'), (1, 'Russian'), (2, 'Kazakh'), (3, 'Polish'), (4, 'Bulgarian')";

