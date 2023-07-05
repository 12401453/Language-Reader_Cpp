let sozdik_result = Object.create(null);
const dictLookupSozdik = (word) => {
    let send_data = "url=https://sozdik.kz/translate/kk/ru/"+encodeURIComponent(word)+"/";
    const httpRequest = (method, url) => {
        const xhttp = new XMLHttpRequest();
        xhttp.open(method, url, true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.responseType = 'text';
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4) {
            sozdik_result = JSON.parse(xhttp.responseText);
            console.log(sozdik_result);
            }
        };
        xhttp.send(send_data);
    };
    httpRequest("POST", "curl_lookup.php");
};
