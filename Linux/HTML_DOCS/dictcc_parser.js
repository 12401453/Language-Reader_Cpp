let dictcc_json = Object.create(null);

const extractText = (element) => {
    let txt = "";
    for (const child of element.childNodes) {
        if(child.nodeName != "DIV") txt += child.textContent;

    };
    return txt.trim();
}

const result_rows = document.getElementsByTagName("tr");



for(const result_row of result_rows) {
    if(result_row.id == '') continue;
    const lefthand_cell = result_row.getElementsByClassName('td7nl')[0];
    const righthand_cell = result_row.getElementsByClassName('td7nl')[1];

    console.log(extractText(lefthand_cell));
}