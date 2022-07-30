
bool WebServer::c_strStartsWith(const char *str1, const char *str2) //str1 must be greater in size than str2 otherwise a stray null-byte in the first byte off the end of the haystack array will match with the null-byte terminator of the string-literal needle and cause the loop to run once more than it should
{
    int strcmp_count = 0;
    int str2_len = strlen(str2);

   // std::cout << *str1 << "------------" << *str2 << std::endl;
   // std::cout << "0x" << std::hex << std::setfill('0') << std::setw(2) << (short)(*str1) << "------------0x" << std::setfill('0') << std::setw(2) << (short)(*str2) << std::dec << std::endl;
    while (*str1 == *str2)
    {
        strcmp_count++;
        str1++;
        str2++;


    //  std::cout << *str1 << "------------" << *str2 << std::endl;
    //  std::cout << "0x" << std::hex << std::setfill('0') << std::setw(2) << (short)(*str1) << "------------0x" << std::setfill('0') << std::setw(2) << (short)(*str2) << std::dec << std::endl;
    }
   // std::cout << strcmp_count << std::endl << str2_len << std::endl;
    if (strcmp_count == str2_len)
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
    char needle_buf[needle_length + 1];

    for(int i = 0; i < haystack_length; i++) {
        for(int j = 0 ; j < needle_length + 1; j++) {
            needle_buf[j] = haystack[j];
        }
       
        if(c_strStartsWith(needle_buf, needle)) {
            break;
        }
        needle_startpos++;
        haystack++;
    }
    return needle_startpos;
}
