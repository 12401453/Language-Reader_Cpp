#include <curl/curl.h>
#include <string>
#include <iostream>

#pragma comment(lib, "libcurl_a.lib")

#pragma comment(lib, "Normaliz.lib")
#pragma comment(lib, "Ws2_32.lib")
#pragma comment(lib, "Wldap32.lib")
#pragma comment(lib, "Crypt32.lib")
#pragma comment(lib, "advapi32.lib")

class CurlFetcher {
    public:
        CurlFetcher(const char* dict_url, std::string curl_cookies="") {
            m_dict_url = dict_url;
            m_curl_cookies = curl_cookies;
        }
        void fetch() {
            CURL *curl;
            CURLcode res;

            curl = curl_easy_init();

            if(curl) {
                curl_easy_setopt(curl, CURLOPT_USERAGENT, "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36");
                curl_easy_setopt(curl, CURLOPT_URL, m_dict_url);
                curl_easy_setopt(curl, CURLOPT_ACCEPT_ENCODING, "");
                curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
                curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L); //timeout after ten seconds (possibly a bit low)

                if(!m_curl_cookies.empty()) {
                    curl_easy_setopt(curl, CURLOPT_COOKIE, m_curl_cookies.c_str());

                }

                curl_easy_setopt(curl, CURLOPT_WRITEDATA, &m_get_html);
                curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);

                /* Perform the request, res will get the return code */
                res = curl_easy_perform(curl);
                /* Check for errors */
                if(res != CURLE_OK) {
                    std::string curl_error_msg = curl_easy_strerror(res);
                    std::cout << "curl_easy_perform() failed: " << curl_error_msg << '\n'; //use std::cout so it gets switched off by the `silent` flag
                    
                    //m_get_html remains empty if the request times out or fails for any other reason
                    //if(curl_error_msg == "Timeout was reached") m_get_html = "Request timeout";
                    if(res == CURLE_OPERATION_TIMEDOUT) m_get_html = "Request timeout";
                    else m_get_html = "curl failure"; //these messages are for telling javascript what to do so I keep them short
                }

                curl_easy_cleanup(curl);
                
            }
        }
        std::string m_get_html;
    private:

        static size_t write_callback(char *ptr, size_t size, size_t nmemb, void *userdata) {

            ((std::string*)userdata)->append(ptr, size*nmemb); //has to be std::string::append not ::assign, because this callback writes a max of 16Kb and repeats itself until the end of the data, so assign just overwrites itself repeatedly and leaves you with just the final 16Kb of the HTML page
            return size*nmemb;
        }

        const char* m_dict_url;
        std::string m_curl_cookies;
};
