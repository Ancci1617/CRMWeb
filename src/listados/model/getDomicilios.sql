SELECT
    DISTINCT Listado.CTE,
    C.ZONA,
    C.`APELLIDO Y NOMBRE` as NOMBRE,
    C.CALLE,
    MR.`BGM DISPONIBLE` AS BGM,
    MR.CALIF as CALIF,
    C.CRUCES,
    C.CRUCES2,
    Listado.RESOLUCION,
    Listado.USUARIO,
    Listado.ID,
    (
        SELECT
            BC.TELEFONO
        FROM
            BaseCTE BC
        WHERE
            BC.CTE = Listado.CTE
            and BC.VALIDACION = 'VALIDO'
        order by
            BC.ID DESC
        LIMIT
            1
    ) AS TELEFONO
FROM
    `Listado`
    LEFT JOIN Clientes C on C.CTE = Listado.CTE
    LEFT join MasterResumen MR on MR.Cliente = Listado.CTE
WHERE
    Listado.CTE NOT LIKE '%Z%'
    AND Listado.RESOLUCION = 'ACTIVO'
    AND C.ZONA = ?
    AND C.CALLE like ?
UNION
SELECT
    DISTINCT Listado.CTE,
    BaseZ.ZONA,
    BaseZ.NOMBRE,
    CONCAT(BaseZ.CALLE, ' ', BaseZ.ALTURA),
    'IMAN' AS BGM,
    '1' AS CALIF,
    '' AS CRUCES,
    '' AS CRUCES2,
    Listado.RESOLUCION,
    Listado.USUARIO,
    Listado.ID,
    BaseZ.TELEFONO
FROM
    Listado
    LEFT JOIN BaseZ ON BaseZ.Z = Listado.CTE
WHERE
    Listado.CTE LIKE '%Z%'
    AND BaseZ.ZONA = ?
    AND BaseZ.CALLE LIKE ?
ORDER BY
    CALLE
limit
    20

