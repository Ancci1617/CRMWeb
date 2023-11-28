

function setLoading(loading = true, elements = []) {
    document.querySelectorAll("input[type='submit']").forEach(element => {
        element.disabled = loading;
    })
    elements.forEach(element => {
        if (loading)
            return element.classList.remove("hidden");

        element.classList.add("hidden");
    })
}



