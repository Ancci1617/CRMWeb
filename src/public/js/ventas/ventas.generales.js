

const btnAprobarArr = document.querySelectorAll("a.btn--aprobar");
const btnDesaprobarArr = document.querySelectorAll("a.btn--desaprobar");

const sendPromptToHrefQuery = (promptMessage,obsRequired) => (e) => {

    const OBS = prompt(promptMessage);
    if (OBS == null) return e.preventDefault();
    if(obsRequired && !OBS) {
        alert("La observacion es obligatoria.")
        return e.preventDefault()
    }
    e.target.href += `?OBS=${OBS}`;

}

btnAprobarArr.forEach(el => el.addEventListener("click", sendPromptToHrefQuery(`Estás a punto de aprobar una venta. Por favor, añade una observación.`)))

btnDesaprobarArr.forEach(el => el.addEventListener("click", sendPromptToHrefQuery(`Estás a punto de desaprobar una venta. Por favor, añade una observación.`,true)))



