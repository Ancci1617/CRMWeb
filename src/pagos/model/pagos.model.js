


const getCobranzaByFicha = async (FICHA) => {

    const [cobanza] = await pool.query(
        "SELECT Cobranzas.VTA as TOTAL, SUM(PagosSV.VALOR) as pagos , "+
        "Cobranzas.VTA - SUM(PagosSV.VALOR) as saldo , VEN as VENCIMIENTO "+
        "FROM Cobranzas left join PagosSV on PagosSV.FICHA = Cobranzas.Ficha where Cobranzas.Ficha = ?;"
        , [FICHA]);
    if (cobranza.length > 0) {
        return cobanza[0];
    }

    return "no encontrado";

}




module.exports = {getCobranzaByFicha}