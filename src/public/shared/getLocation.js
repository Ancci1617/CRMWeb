const getLocation = () => {

    return new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(

            location => {
                res(location);
            },
            error => {
                rej(error)
            },
            { enableHighAccuracy: true });

    })



}