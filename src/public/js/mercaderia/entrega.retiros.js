const select_all = document.querySelectorAll("select");
const input_all = document.querySelectorAll("input.hidden");
for (let i = 0; i < select_all.length; i++) {
    asociarInputOption(select_all[i], input_all[i]);
}


