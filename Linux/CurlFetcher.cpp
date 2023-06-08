#include <curl/curl.h>
#include <string>
#include <iostream>

class CurlFetcher {
    public:
        CurlFetcher(const char* dict_url) {
            m_dict_url = dict_url;
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

                curl_easy_setopt(curl, CURLOPT_WRITEDATA, &m_get_html);
                curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);

                /* Perform the request, res will get the return code */
                res = curl_easy_perform(curl);
                /* Check for errors */
                if(res != CURLE_OK) {
                fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
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
};