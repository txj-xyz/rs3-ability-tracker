// Import dependencies.
const Manager = require('../base/Manager.js');

// Function to get frontend page paths.
module.exports = class RandomID extends Manager {

    static #list = [...[...Array(26)].map((_, i) => String.fromCharCode(i + 65)), ...[...Array(26)].map((_, i) => String.fromCharCode(i + 65).toLowerCase()), ...[...Array(10).keys()]]
    static #random = _ => this.#list[Math.floor(Math.random() * this.#list.length)]

    static init() {
        return (sections = 5, phrase = 5, join = '-') => [...Array(sections)].map(_ => [...Array(phrase)].map(this.#random).join('')).join(join);
    }
};
