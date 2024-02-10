const isDecimal = (num)  => {
    return (num % 1)
}

const round = (number,decimals) => {
    // return parseFloat(parseFloat(number).toFixed(decimals))
    return Math.round(parseFloat(parseFloat(number*10**decimals).toFixed(decimals)))/10**decimals

    // return Math.round(number * 10 ** decimals) / (10 ** decimals)

}


module.exports = {isDecimal,round}