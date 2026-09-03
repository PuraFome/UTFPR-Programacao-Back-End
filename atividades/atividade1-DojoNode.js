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

const maiorComprador = usuarios.reduce((maior, usuario) => {
    return calcularTotalCompras(usuario.compras) > calcularTotalCompras(maior.compras) ? usuario : maior;
});
console.log(`Maior comprador: ${maiorComprador.nome}`);
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

// Desafio 6 - Desafio Arrow Function vs Function
//Observe os dois códigos:

// Código 1
const pessoa = {
  nome: "Maria",
  falar: function(){
    console.log(this.nome);
  }
};

pessoa.falar();

// Código 2
const pessoa2 = {
  nome: "Maria",
  falar: () => {
    console.log(this.nome);
  }
};

pessoa2.falar();

// Resposta: A diferença entre os dois códigos está no comportamento do `this`. 
// No Código 1, a função `falar` é uma função regular, e o `this` dentro dela 
// se refere ao objeto `pessoa`, permitindo acessar a propriedade `nome`. Portanto, 
// ao chamar `pessoa.falar()`, ele imprime "Maria", já no segundo código, a função `falar` 
// é uma arrow function, e o `this` dentro dela não se refere ao objeto `pessoa2`, 
// mas sim ao contexto léxico em que a função foi definida, resultando em `undefined` ao tentar 
// acessar `this.nome`. Portanto, ao chamar `pessoa2.falar()`,

// Desafio 7 --- Desafio Final
console.log("\n--- Desafio 7: Desafio Final (Gerar relatório) ---");
const gerarRelatorio = (usuarios) => {
    const totalUsuarios = usuarios.length;
    const usuariosAtivos = usuarios.filter(usuario => usuario.ativo).length;
    const usuariosInativos = totalUsuarios - usuariosAtivos;
    const mediaIdade = usuarios.reduce((total, usuario) => total + usuario.idade, 0) / totalUsuarios;

    return {
        totalUsuarios,
        usuariosAtivos,
        usuariosInativos,
        mediaIdade,
        maiorComprador: maiorComprador.nome // retuliza o código do desafio 4
    };
};

console.log(JSON.stringify(gerarRelatorio(usuarios),null, 2));

// Desafio extra 
// usuario mais jovem, mais velho, valor médio das compras por usuário, no estilo nome:média.
console.log("\n--- Desafio Extra ---");
const desafioExtra = (usuarios) => {
    const usuarioMaisJovem = usuarios.reduce((maisJovem, usuario) => {
        return usuario.idade < maisJovem.idade ? usuario : maisJovem;
    });
    const usuarioMaisVelho = usuarios.reduce((maisVelho, usuario) => {
        return usuario.idade > maisVelho.idade ? usuario : maisVelho;
    });
    const mediaCompras = usuarios.map(usuario => {
        const totalCompras = calcularTotalCompras(usuario.compras);
        const media = usuario.compras.length > 0 ? totalCompras / usuario.compras.length : 0;
        return { nome: usuario.nome, mediaCompras: media };
    });
    return {
        usuarioMaisJovem: usuarioMaisJovem.nome,
        usuarioMaisVelho: usuarioMaisVelho.nome,
        mediaCompras
    };
};

console.log(JSON.stringify(desafioExtra(usuarios), null, 2));