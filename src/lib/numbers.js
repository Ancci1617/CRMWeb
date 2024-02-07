const isDecimal = (num)  => {
    return (num % 1)
}

const round = (number,decimals) => {

    return Math.round(number * 10 * decimals) / (10 * decimals)

}


module.exports = {isDecimal,round}