#include <iostream>
#include <string.h>

bool c_strStartsWith(const char *str1, const char *str2)
{

    int strcmp_count = 0;
    int str2_len = strlen(str2);

    while (*str1 == *str2)
    {
        strcmp_count++;
        str1++;
        str2++;
    }
    std::cout << strcmp_count << std::endl;

    if (strcmp_count == str2_len)
    {
        return true;
    }
    else
        return false;
}

int main () {

    std::cout << c_strStartsWith("GET /dk/dk.html HTTP/1.1", "GET") << std::endl;
}