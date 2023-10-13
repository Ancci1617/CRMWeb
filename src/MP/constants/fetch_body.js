const get_body = (MP_TOKEN) => {

    return {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + MP_TOKEN
        }
    }


}

module.exports = {get_body}; 