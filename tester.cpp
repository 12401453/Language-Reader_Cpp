#include <iostream>
#include <string.h>
#include <string>
#include <unicode/unistr.h>
#include <unicode/regex.h>
#include <unicode/brkiter.h>



int main() {
    
    while(1) {
    std::cout << "Enter test-word: ";
    std::string test_word;
    std::cin >> test_word;
    if(test_word == "quit") break;
    icu::UnicodeString token_unicode = test_word.c_str();

  /*  int comma_pos = token_unicode.indexOf("\'");
    while(comma_pos != -1) {
        token_unicode.setTo("¬", comma_pos)
    } */

    token_unicode.findAndReplace("'", "¬");

    std::string token;
    token_unicode.toUTF8String(token);
    std::cout << token << std::endl;
    token = "";
    }
    return 0;
}