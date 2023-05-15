const pool = require("../connection-database");


const getStockDeposito = async (UNIDAD) => {
    const [stock] = await pool.query(
        "SELECT LP.Art,SUM(EFECTO) AS CANTIDAD,LP.Producto  FROM `STOCK` " + 
        "left JOIN LP on LP.Art = STOCK.ART where LP.Art is not null group by ART  " + 
        "ORDER BY `LP`.`Art`  ASC;"
        );

    return stock;
}
const getStockByMotivo = async (MOTIVO) => {
    const [stock] = await pool.query(
        "SELECT `ID`, `CAMIONETA`, `CTE`, `FICHA`, `ART`, `VENDEDOR`, `CONTROL`, `ESTADO`, `CARGADO`, `ARTICULOS_CONTROL`, "  +  
        "`ARTICULOS_VENDEDOR`, `OBS`, `FECHA`, `EFECTO`, `EFECTO_UNIDAD`, `MOTIVO`, `ID_VENTA` FROM `STOCK` WHERE MOTIVO = ?",
        [MOTIVO]
    );
    
    return stock; 

}

const getRandomControl = async () => {
    const [stock] = await pool.query(
        "Select LP.Art,round(Rand() * 100 ,0) AS ALEATORIO,LP.Producto from LP order by ALEATORIO limit 10;"
        );

    return stock;
}

const getVigentes = async (arts) => {
    const [vigentes] = await pool.query(
        "SELECT LP.ART,SUM(STOCK.EFECTO) as VIGENTE FROM `LP` left join STOCK on STOCK.ART = LP.Art  where LP.Art in ?  GROUP BY ART ;",[[arts]]
    );
    return vigentes;
}

module.exports = {getStockDeposito,getRandomControl,getVigentes,getStockByMotivo}

