import Heroe from "../heroe.js";
import Villano from "../villano.js";

const jsonString = '[{"id":1, "nombre":"Clark", "apellido":"Kent", "edad":45, "alterego":"Superman", "ciudad":"Metropolis","publicado":2002},{"id":2, "nombre":"Bruce", "apellido":"Wayne", "edad":35, "alterego":"Batman", "ciudad":"Gotica","publicado":20012},{"id":3, "nombre":"Bart", "apellido":"Alen", "edad":30, "alterego":"Flash", "ciudad":"Central","publicado":2017},{"id":4, "nombre":"Lex", "apellido":"Luthor", "edad":18, "enemigo":"Superman", "robos":500,"asesinatos":7},{"id":5, "nombre":"Harvey", "apellido":"Dent", "edad":20, "enemigo":"Batman", "robos":750,"asesinatos":2},{"id":666, "nombre":"Celina", "apellido":"kyle", "edad":23, "enemigo":"Batman", "robos":25,"asesinatos":1}]';
const listaInicial = JSON.parse(jsonString);
const storage = JSON.parse(localStorage.getItem("storage")) || [];
//var datosEnPantalla = [];
const keysArray = new Array("id", "nombre", "apellido", "edad", "alterego", "ciudad", "publicado", "enemigo", "robos", "asesinatos");
const formDatos = document.forms[0];
const formABM = document.forms[1];
const divTabla = document.getElementById("divTabla");
const divCheckboxes = document.getElementById("divCheckboxes");
const txtPromedio = document.getElementById("txtPromedio");
const btnCalcular = document.getElementById("btnCalcular");
const selectTipo = document.getElementById("selectTipo");
const btnReset = document.getElementById("btnReset");
const rdoHeroe = document.getElementById("rdoHeroe");
const rdoVillano = document.getElementById("rdoVillano");
const inpAlterEgo = document.getElementById("txtAlterEgo");
const inpCiudad = document.getElementById("txtCiudad");
const inpPublicado = document.getElementById("txtPublicado");
const inpEnemigo = document.getElementById("txtEnemigo");
const inpRobos = document.getElementById("txtRobos");
const inpAsesinatos = document.getElementById("txtAsesinatos");
const labelErrorMessage = document.getElementById("labelErrorMessage");

if (listaInicial.length > 0) {
    actualizarStorage(listaInicial);
}

selectTipo.addEventListener("change", function () {
    const tipoSeleccionado = selectTipo.value;
    const storageList = getStorage(JSON.parse(localStorage.getItem("storage")) || []);
    if (storageList.length > 0) {
        const listaFiltrada = storageList.filter(element => {
            if (tipoSeleccionado === "todos") {
                return true;
            } else if (tipoSeleccionado === "heroes") {
                return element instanceof Heroe;
            } else if (tipoSeleccionado === "villanos") {
                return element instanceof Villano;
            }
        });
        actualizarTabla(listaFiltrada);
    } else {
        console.log("No hay elementos almacenados.");
        actualizarTabla(storageList);
    }
});

btnCalcular.addEventListener("click", () => {
    const data = JSON.parse(localStorage.getItem("datosActuales"));
    if (data) {
        let total = 0;
        data.map(({ edad }) => total += edad)
        const resultado = total / data.length;
        txtPromedio.value = resultado;
    }
});

window.addEventListener("click", (e) => {
    if (e.target.matches("td")) {
        cargarFormulario(storage.find((element) => element.id == e.target.parentElement.dataset.id));
        if (formABM.hasAttribute("hidden")) {
            switchForms();
        }
    }
    else if (e.target.matches("#btnAgregar")) {
        if (formABM.hasAttribute("hidden")) {
            switchForms();
        }
        inpEnemigo.toggleAttribute("hidden");
        inpRobos.toggleAttribute("hidden");
        inpAsesinatos.toggleAttribute("hidden");
    }
    else if (e.target.matches("#btnCancelar")) {
        limpiarFormulario();
    }
    else if (e.target.matches("#btnEliminar")) {
        bajaPersona(parseInt(formABM.txtID.value));
        limpiarFormulario();
    }
    else if (e.target.matches("#rdoVillano")) {
        if (inpEnemigo.hasAttribute("hidden") && inpRobos.hasAttribute("hidden") && inpAsesinatos.hasAttribute("hidden")) {
            inpEnemigo.removeAttribute("hidden");
            inpRobos.removeAttribute("hidden");
            inpAsesinatos.removeAttribute("hidden");
        }
        if (!inpAlterEgo.hasAttribute("hidden") && !inpCiudad.hasAttribute("hidden") && !inpPublicado.hasAttribute("hidden")) {
            inpAlterEgo.setAttribute("hidden", "hidden");
            inpCiudad.setAttribute("hidden", "hidden");
            inpPublicado.setAttribute("hidden", "hidden");
        }
    }
    else if (e.target.matches("#rdoHeroe")) {
        if (inpAlterEgo.hasAttribute("hidden") && inpCiudad.hasAttribute("hidden") && inpPublicado.hasAttribute("hidden")) {
            inpAlterEgo.removeAttribute("hidden");
            inpCiudad.removeAttribute("hidden");
            inpPublicado.removeAttribute("hidden");
        }
        if (!inpEnemigo.hasAttribute("hidden") && !inpRobos.hasAttribute("hidden") && !inpAsesinatos.hasAttribute("hidden")) {
            inpEnemigo.setAttribute("hidden", "hidden");
            inpRobos.setAttribute("hidden", "hidden");
            inpAsesinatos.setAttribute("hidden", "hidden");
        }
    }
    else if (e.target.matches("th")) {
        const th = e.target.textContent;
        sortTable(th);
    }
});

formABM.addEventListener("submit", (e) => {
    e.preventDefault();
    const { txtID, txtNombre, txtApellido, txtEdad, rdoTipo, txtAlterEgo, txtCiudad, txtPublicado, txtEnemigo, txtRobos, txtAsesinatos } = formABM;
    var nuevaPersona = new Object();
    if (rdoHeroe.checked) {
        if (txtPublicado.value < 1941) {
            showErrorMessage();
            return false;
        }
        nuevaPersona = new Heroe(txtID.value, txtNombre.value, txtApellido.value, parseInt(txtEdad.value), txtAlterEgo.value, txtCiudad.value, parseInt(txtPublicado.value));
    } else {
        if (txtRobos.value < 0 || txtAsesinatos.value < 0) {
            showErrorMessage();
            return false;
        }
        nuevaPersona = new Villano(txtID.value, txtNombre.value, txtApellido.value, parseInt(txtEdad.value), txtEnemigo.value, parseInt(txtRobos.value), parseInt(txtAsesinatos.value));
    }
    if (nuevaPersona.id === '') {
        nuevaPersona.id = Date.now();
        altaPersona(nuevaPersona);
    } else {
        modifPersona(nuevaPersona);
    }
    limpiarFormulario();
});

keysArray.map(headerName => {
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = headerName;

    checkbox.checked = true;
    checkbox.addEventListener("change", function () {
        filtrarTabla(checkbox.id);
    });

    let label = document.createElement("label");
    label.textContent = headerName;
    divCheckboxes.appendChild(checkbox);
    divCheckboxes.appendChild(label);
});

btnReset.addEventListener("click", () => {
    if (listaInicial.length > 0) {
        actualizarStorage(listaInicial);
    }
});

function actualizarStorage(data) {
    localStorage.removeItem("storage");
    localStorage.setItem("storage", JSON.stringify(data));
    actualizarTabla(data);
}

function actualizarDatosActuales(data) {
    localStorage.setItem("datosActuales", JSON.stringify(data));
    //datosEnPantalla = data;
}

function getStorage(data) {
    const list = [];
    data.forEach(item => {
        if ('ciudad' in item && 'publicado' in item) {
            const heroe = new Heroe(item.id, item.nombre, item.apellido, item.edad, item.alterego, item.ciudad, item.publicado);
            list.push(heroe);
        } else if ('enemigo' in item && 'robos' in item && 'asesinatos' in item) {
            const villano = new Villano(item.id, item.nombre, item.apellido, item.edad, item.enemigo, item.robos, item.asesinatos);
            list.push(villano);
        }
    });
    return list;
}

function altaPersona(nuevoObjeto) {
    storage.push(nuevoObjeto);
    actualizarStorage(storage);
}

function modifPersona(nuevoObjeto) {
    let indice = storage.findIndex((item) => {
        return item.id == nuevoObjeto.id;
    });
    storage.splice(indice, 1, nuevoObjeto);
    actualizarStorage(storage);
}

function bajaPersona(id) {
    let indice = storage.findIndex((item) => {
        return item.id == id;
    });
    storage.splice(indice, 1);
    actualizarStorage(storage);
}

function actualizarTabla(data) {
    actualizarDatosActuales(data);
    while (divTabla.hasChildNodes()) {
        divTabla.removeChild(divTabla.firstElementChild);
    }
    if (data) {
        divTabla.appendChild(crearTabla(data));
    }
}

function crearTabla(data) {
    const tabla = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const columnas = [];
    data.forEach(element => {
        for (const key in element) {
            if (!columnas.includes(key)) {
                columnas.push(key);
            }
        }
    });
    const cabecera = document.createElement("tr");
    columnas.forEach(columna => {
        const th = document.createElement("th");
        const texto = document.createTextNode(columna);
        th.appendChild(texto);
        cabecera.appendChild(th);
    });
    thead.appendChild(cabecera);
    tabla.appendChild(thead);

    data.forEach(element => {
        const tr = document.createElement("tr");
        columnas.forEach(columna => {
            if (columna === "id") {
                tr.setAttribute("data-id", element[columna]);
                const td = document.createElement("td");
                td.textContent = element[columna];
                tr.appendChild(td);
            }
            else {
                const td = document.createElement("td");
                td.textContent = (element[columna] !== undefined && element[columna] !== null) ? element[columna] : "-"; // Evita valores undefined
                tr.appendChild(td);
            }
        });
        tbody.appendChild(tr);
    });
    tabla.appendChild(tbody);
    tabla.setAttribute("id", "tablaPersonas");
    return tabla;
}

function cargarFormulario(objeto) {
    const { txtID, txtNombre, txtApellido, txtEdad, rdoTipo, txtAlterEgo, txtCiudad, txtPublicado, txtEnemigo, txtRobos, txtAsesinatos } = formABM;

    txtID.value = objeto.id;
    txtNombre.value = objeto.nombre;
    txtApellido.value = objeto.apellido;
    txtEdad.value = objeto.edad;
    if (objeto.publicado >= 0) {
        txtAlterEgo.value = objeto.alterego;
        txtCiudad.value = objeto.ciudad;
        txtPublicado.value = objeto.publicado;
        txtEnemigo.toggleAttribute("hidden");
        txtRobos.toggleAttribute("hidden");
        txtAsesinatos.toggleAttribute("hidden");
        rdoTipo.value = "heroe";
        rdoHeroe.checked = true;
        rdoVillano.disabled = true;
    }
    else if (objeto.robos >= 0 && objeto.asesinatos >= 0) {
        txtEnemigo.value = objeto.enemigo;
        txtRobos.value = objeto.robos;
        txtAsesinatos.value = objeto.asesinatos;
        txtAlterEgo.toggleAttribute("hidden");
        txtCiudad.toggleAttribute("hidden");
        txtPublicado.toggleAttribute("hidden");
        rdoTipo.value = "villano";
        rdoVillano.checked = true;
        rdoHeroe.disabled = true;
    }
}

function limpiarFormulario() {
    formABM.reset();
    formABM.txtID.value = '';
    txtAlterEgo.removeAttribute("hidden");
    txtCiudad.removeAttribute("hidden");
    txtPublicado.removeAttribute("hidden");
    txtEnemigo.removeAttribute("hidden");
    txtRobos.removeAttribute("hidden");
    txtAsesinatos.removeAttribute("hidden");
    rdoVillano.disabled = false;
    rdoHeroe.disabled = false;
    if (!labelErrorMessage.hasAttribute("hidden")) {
        labelErrorMessage.toggleAttribute("hidden");
    }
    switchForms();
}

function switchForms() {
    if (formABM.hasAttribute("hidden")) {
        formABM.removeAttribute("hidden");
    } else {
        formABM.setAttribute("hidden", "hidden");
    }
    if (formDatos.hasAttribute("hidden")) {
        formDatos.removeAttribute("hidden");
    } else {
        formDatos.setAttribute("hidden", "hidden");
    }
}

function showErrorMessage() {
    if (labelErrorMessage.hasAttribute("hidden")) {
        labelErrorMessage.toggleAttribute("hidden");
    }
}

function sortTable(columna) {
    let tipoColumna = getColumnType(columna);

    storage.sort((a, b) => {
        let valorA = tipoColumna === "number" ? parseFloat(a[columna]) : a[columna];
        let valorB = tipoColumna === "number" ? parseFloat(b[columna]) : b[columna];
        if (valorA > valorB) {
            return 1;
        } else if (valorA < valorB) {
            return -1;
        } else {
            return 0;
        }

    });

    actualizarTabla(storage);
}

function getColumnType(columna) {
    switch (columna) {
        case "id":
        case "edad":
        case "publicado":
        case "robos":
        case "asesinatos":
            return "number";
        default:
            return "string";
    }
}

/*function filtrarTabla(atributo) {
    console.log(atributo);
    console.log(datosEnPantalla);
    datosEnPantalla.forEach(item => {
        if (item.hasOwnProperty(atributo)) {
            delete item[atributo];
        }
    });
    actualizarTabla(datosEnPantalla);
    console.log(datosEnPantalla);
}*/