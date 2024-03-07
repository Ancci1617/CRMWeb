const pool = require("../../../model/connection-database");

const getListadoDeClientes = async () => {
  const [listaDeClientes] = await pool.query(
    `SELECT CteList.CTE from 
    (SELECT Fichas.CTE FROM Fichas union SELECT BaseDetalle.CTE from BaseDetalle) CteList 
    INNER JOIN ClientesSV on ClientesSV.CTE = CteList.CTE;`
  );
  return listaDeClientes.map((data) => data.CTE);
};

module.exports = { getListadoDeClientes };
