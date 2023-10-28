import Persona from "./persona.js";

export default class Heroe extends Persona {
    constructor(id, nombre, apellido, edad, alterego, ciudad, publicado) {
        super(id, nombre, apellido, edad);
        this.alterego = alterego;
        this.ciudad = ciudad;
        this.publicado = publicado;
    }
}