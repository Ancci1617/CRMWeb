const createArrayFromCsv = (csv) => {
    const rows = csv.split("\n");
    const csvArray = rows.map(row => row.split(";"));
    return csvArray
}

module.exports = {createArrayFromCsv}