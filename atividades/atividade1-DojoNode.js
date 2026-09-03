const usuarios = [
    { nome: "Ana", idade: 20, ativo: true, compras: [100, 50, 25] },
    { nome: "Bruno", idade: 17, ativo: false, compras: [30, 20] },
    { nome: "Carlos", idade: 32, ativo: true, compras: [200, 150, 50, 100] },
    { nome: "Diana", idade: 25, ativo: true, compras: [] },
    { nome: "Eduardo", idade: 15, ativo: false, compras: [10] }
]

// Parte 1 — Total de Compras por Usuário
const calcularTotalCompras = (compras) => compras.reduce((total, valor) => total + valor, 0);

console.log("--- Parte 1 — Total de Compras por Usuário ---");
usuarios.forEach(usuario => {
    console.log(`${usuario.nome}: Total de Compras R$ ${calcularTotalCompras(usuario.compras)}`);
});

// Parte 2 — Usuários Ativos 
console.log("\n--- Parte 2 — Usuários Ativos ---");
usuarios.filter(usuario => usuario.ativo).forEach(usuario => console.log(usuario.nome));

// Parte 3 — Usuários Maiores de Idade
console.log("\n--- Parte 3 — Usuários Maiores de Idade ---");
usuarios.filter(usuario => usuario.idade >= 18).forEach(usuario => console.log(`Nome: ${usuario.nome}, Idade: ${usuario.idade}`));

// Parte 4 — Usuários com o Maior Volume de Compras
console.log("\n--- Parte 4 — Usuários com o Maior Volume de Compras ---");

const maiorVolumeCompras = Math.max(...usuarios.map(usuario => calcularTotalCompras(usuario.compras)));

usuarios.filter(usuario => calcularTotalCompras(usuario.compras) === maiorVolumeCompras).forEach(usuario => console.log(`${usuario.nome}: Total de Compras R$ ${maiorVolumeCompras}`));

// Desafio 5 - Coerção de tipos em javascript
//Analise o seguinte código:

console.log("5" + 2);
// como um tipo é string e o outro é numérico, o operador + realiza a concatenação, pois em javascript + é usado 
// para some e concatenação assim transformando o 2 em string e concatenando, resultando em "52".
console.log("5" - 2);
// como - só é usado para subtração, o javascript converte a string "5" em número e realiza a subtração, resultando em 3.
console.log(true + 1);
// aqui o + é considerado uma adição, true é convertido para 1, então 1 + 1 resulta em 2.
console.log(false == 0);
// == é uma comparação, então false é convertido para 0, então a comparação é verdadeira, resultando em true.
console.log(false === 0);
// === é uma comparação de igualdade estrita, então false é do tipo boolean e não é convetido para 0, como anterior, 
// como 0 é do tipo number, então a comparação é falsa, resultando em false.

// em resumo, a coerção de tipos em javascript é a conversão automática de um tipo de dado para outro, dependendo do contexto da operação.
// por isso eu prefiro o typescript, pois ele é mais seguro e não permite esse tipo de comportamento inesperado, no desenvolvimento isso 
// resultaria em erro, impedindo o dev de compilar o código, caso tenha esse tipo de comparação.

