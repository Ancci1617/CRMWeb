function asociarInputOption(displayedOptions, input) {
    //Recibe un input y un options
    displayedOptions.addEventListener("change", e => {
        input.value = displayedOptions.options.item(displayedOptions.selectedIndex).innerText;
    })

}