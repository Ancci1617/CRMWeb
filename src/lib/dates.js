function getToday(){
    return new Date().toISOString().split("T")[0]
}

module.exports = {
    getToday
}




