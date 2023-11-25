

function setLoading(loading = true){
    document.querySelectorAll("input[type='submit']").forEach(element => {
        element.disabled = loading;
    })

}



