async function getRazonSocialDni(dni){
    //Consulta el CUIT Con el Dni del parametros
    const response_cuit = await fetch(`https://afip.tangofactura.com/Index/GetCuitsPorDocumento/?NumeroDocumento=${dni}`);
    const response_cuit_json = await response_cuit.json();

    if(!response_cuit_json.success) 
        return "Dni invalido"
    //cONSULTA EL CONTRIBUYENTE CON EL CUIT
    const cuits = response_cuit_json.data;
    const response_contribuyente = await fetch(`https://afip.tangofactura.com/Index/GetContribuyente/?cuit=${cuits[0]}`);
    const response_contribuyente_json = await response_contribuyente.json();

    if(response_contribuyente_json.errorGetData == true || response_contribuyente_json.error)
        return "Razon social invalida"
    //=nomPropio de excel
    const {nombre} = response_contribuyente_json.Contribuyente
    const nombre_prop = nombre.toLocaleLowerCase().split(" ").map(word => word.replace(word.charAt(0),word.charAt(0).toUpperCase())  ).join(" ");
    return nombre_prop;

}