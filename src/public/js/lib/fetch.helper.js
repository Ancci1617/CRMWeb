//Mover a lib
function getFetchPostBody(body) {

    const fetch_body = {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
    }
    return fetch_body;

}

async function fetchPost(url,JSON_BODY = {}){
    const fetch_body = await getFetchPostBody(JSON_BODY);
    const response = await fetch(url,fetch_body);
    const json_response = await response.json();
    return json_response;
}

async function fetchPostAndSetTable(url, table_body, JSON_BODY = {}) {
    const json_response = await fetchPost(url,JSON_BODY);
    setData(table_body, json_response);
}
