//aula sobre map (variavel chave valor)

const mapa = new Map();

mapa.set("nome", "carlos");
mapa.set("idade", 30);

console.log(`Nome: ${mapa.get("nome")}, idade: ${mapa.get("idade")}`);

class Pessoa {
    constructor(nome, idade) {
        this.nome = nome;
        this.idade = idade;
    }

    apresentar() {
        console.log(`Olá, meu nome é ${this.nome} e tenho ${this.idade} anos.`);
    }
}

let pessoa1 = new Pessoa("Carlos", 30);
pessoa1.apresentar();

