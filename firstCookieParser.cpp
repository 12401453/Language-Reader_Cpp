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