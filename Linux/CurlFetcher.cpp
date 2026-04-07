#include <curl/curl.h>
#include <string>
#include <iostream>

class CurlFetcher {
    
    public:
        CurlFetcher(const char* dict_url, std::string curl_cookies, std::string pons_api_key="") {
            m_dict_url = dict_url;
            m_curl_cookies = curl_cookies;
            m_pons_api_key = pons_api_key;               
        }

        enum ContentType {
            X_WWW_FORM_URLENCODED,
            JSON
        };

        void fetch(std::string query_url="") {
            CURL *curl;
            CURLcode res;
            m_get_html.clear();
            curl = curl_easy_init();
            struct curl_slist *headers_list = nullptr;

            if(query_url.empty()) query_url = m_dict_url;

            if(curl) {
                curl_easy_setopt(curl, CURLOPT_USERAGENT, "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36");
                curl_easy_setopt(curl, CURLOPT_URL, query_url.c_str());
                curl_easy_setopt(curl, CURLOPT_ACCEPT_ENCODING, "");
                curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
                curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L); //timeout after ten seconds (possibly a bit low)

                if(!m_curl_cookies.empty()) {
                    curl_easy_setopt(curl, CURLOPT_COOKIE, m_curl_cookies.c_str());
                }

                if(!m_pons_api_key.empty()) { 
                    std::string pons_api_x_secret_header = "X-Secret: " + m_pons_api_key;
                    headers_list = curl_slist_append(headers_list, pons_api_x_secret_header.c_str());
                    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers_list);
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

                    error_state = true;
                }                
            }
            curl_slist_free_all(headers_list);
            curl_easy_cleanup(curl);
        }

        void fetchPOST(std::string post_data, ContentType content_type=X_WWW_FORM_URLENCODED) {
            CURL* curl;
            CURLcode res;

            m_post_response.clear();

            curl = curl_easy_init();

            struct curl_slist *headers_list = nullptr;

            std::string content_type_header;
            switch(content_type) {
                case X_WWW_FORM_URLENCODED:
                    content_type_header = "Content-Type: application/x-www-form-urlencoded";
                    break;
                case JSON:
                    content_type_header = "Content-Type: application/json";
                    break;
                default:
                    content_type_header = "Content-Type: application/x-www-form-urlencoded";
                    break;
            }

            std::string content_length_header = "Content-Length: " + std::to_string(post_data.size());

            headers_list = curl_slist_append(headers_list, content_type_header.c_str());
            headers_list = curl_slist_append(headers_list, content_length_header.c_str());

            if(curl) {
                curl_easy_setopt(curl, CURLOPT_POST, 1);
                curl_easy_setopt(curl, CURLOPT_POSTFIELDS, post_data.c_str());

                curl_easy_setopt(curl, CURLOPT_USERAGENT, "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36");
                curl_easy_setopt(curl, CURLOPT_URL, m_dict_url);
                curl_easy_setopt(curl, CURLOPT_ACCEPT_ENCODING, "");
                curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L); //timeout after ten seconds (possibly a bit low)

                curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers_list);


                curl_easy_setopt(curl, CURLOPT_WRITEDATA, &m_post_response);
                curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);

                //std::cout << "just before post perform\n";
                res = curl_easy_perform(curl);
                //std::cout << "just after post perform\n";

                if(res != CURLE_OK) {
                    std::string curl_error_msg = curl_easy_strerror(res);
                    std::cout << "curl_easy_perform() failed: " << curl_error_msg << '\n'; //use std::cout so it gets switched off by the `silent` flag
                    
                    if(res == CURLE_OPERATION_TIMEDOUT) m_post_response = "Request timeout";
                    else m_post_response = "curl failure"; //these messages are for telling javascript what to do so I keep them short

                    error_state = true;
                }
            }
            curl_slist_free_all(headers_list);
            curl_easy_cleanup(curl);
        }

        std::string m_get_html;
        std::string m_post_response;
        bool error_state = false;
        
    private:

        static size_t write_callback(char *ptr, size_t size, size_t nmemb, void *userdata) {

            ((std::string*)userdata)->append(ptr, size*nmemb); //has to be std::string::append not ::assign, because this callback writes a max of 16Kb and repeats itself until the end of the data, so assign just overwrites itself repeatedly and leaves you with just the final 16Kb of the HTML page
            return size*nmemb;
        }

        const char* m_dict_url;
        std::string m_curl_cookies;
        std::string m_pons_api_key;
};
