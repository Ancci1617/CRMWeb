//Recibe un bojeto tipo DATE  o un string y le da el formato para generar reportes de mercadoPago
const formatDates = (date) => {
    const dateObj = new Date(date);
    return dateObj.toISOString().split("T")[0] + "T00:00:00Z";


}

const getLimitDatesToday = (date) => {
    const dateObj = new Date(date);
    const START_DATE = dateObj.toISOString().split("T")[0] + "T00:00:00Z";
    const END_DATE = new Date(dateObj.setUTCDate(dateObj.getUTCDate() + 1)).toISOString().split("T")[0] + "T00:00:00Z"
    return {START_DATE,END_DATE};
}

module.exports = { formatDates,getLimitDatesToday }