const get_body = (MP_TOKEN) => {

    return {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + MP_TOKEN
        }
    }


}

module.exports = { get_body }; 