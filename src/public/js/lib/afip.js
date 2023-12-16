async function getRazonSocialDni(dni, EsCuit = false) {
    console.log(dni, EsCuit)
    //Consulta el CUIT Con el Dni del parametros
    let cuits = EsCuit ? [dni] : undefined;
    if (!EsCuit) {

        const response_cuit = await fetch(`https://afip.tangofactura.com/Index/GetCuitsPorDocumento/?NumeroDocumento=${dni}`);
        const response_cuit_json = await response_cuit.json();

        if (response_cuit_json.error)
            throw new Error(response_cuit_json.error)

        cuits = response_cuit_json.data;
    }


    if (!cuits)
        throw new Error("No existe el DNI");

    //cONSULTA EL CONTRIBUYENTE CON EL CUIT
    let nombre = "";
    for (let i = 0; i < cuits.length; i++) {
        const response_contribuyente = await fetch(`https://afip.tangofactura.com/Index/GetContribuyente/?cuit=${cuits[i]}`)
        const response_contribuyente_json = await response_contribuyente.json()

        if (response_contribuyente_json.errorGetData == true || response_contribuyente_json.error)
            throw new Error("No se pudo consultar la razon social")

        nombre = `${nombre} ${response_contribuyente_json.Contribuyente.nombre} ${i == cuits.length - 1 ? "" : "/"}`

    }
    //=nomPropio de excel
    // const { nombre } = response_contribuyente_json.Contribuyente
    const nombre_prop = nombre.toLocaleLowerCase().split(" ").map(word => word.replace(word.charAt(0), word.charAt(0).toUpperCase())).join(" ");
    return nombre_prop;

}