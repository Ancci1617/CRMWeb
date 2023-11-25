function unableSpaces(element) {
    element.addEventListener("keyup", e => {
        element.value = element.value.replaceAll(" ", "")
    });
}
