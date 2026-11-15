const produtos = {
    combo: { nome: "Combo Lil's", preco: 59.90 },
    carne: { nome: 'Picanha na Brasa', preco: 28.90 },
    frango: { nome: 'Espetinho de Frango', preco: 16.90 },
    linguica: { nome: 'Linguica na Brasa', preco: 15.90 }
};

function dinheiro(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

function lerCarrinho() {
    return JSON.parse(localStorage.getItem('carrinho')) || {};
}

function salvarCarrinho(carrinho) {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    mostrarTotalCarrinho();
}

function mostrarTotalCarrinho() {
    const carrinho = lerCarrinho();
    let total = 0;

    for (const id in carrinho) {
        if (produtos[id]) {
            total += carrinho[id];
        }
    }

    document.getElementById('total-carrinho').textContent = total;
}

function somenteNumeros(texto) {
    return texto.replace(/\D/g, '');
}

function formatarTelefone(campo) {
    let numeros = somenteNumeros(campo.value).slice(0, 11);

    if (numeros.length > 2) {
        numeros = '(' + numeros.slice(0, 2) + ') ' + numeros.slice(2);
    }

    if (numeros.length > 10) {
        numeros = numeros.slice(0, 10) + '-' + numeros.slice(10);
    }

    campo.value = numeros;
}

function formatarCep(campo) {
    let numeros = somenteNumeros(campo.value).slice(0, 8);

    if (numeros.length > 5) {
        numeros = numeros.slice(0, 5) + '-' + numeros.slice(5);
    }

    campo.value = numeros;
}

function ligarMascaras(telefone, cep) {
    telefone.addEventListener('input', function () {
        formatarTelefone(telefone);
    });

    cep.addEventListener('input', function () {
        formatarCep(cep);
    });
}

const botaoTema = document.getElementById('botao-tema');

function mostrarTema() {
    const escuro = localStorage.getItem('tema') === 'escuro';
    document.documentElement.classList.toggle('escuro', escuro);
    botaoTema.querySelector('span').textContent = escuro ? 'Claro' : 'Escuro';
    botaoTema.querySelector('img').src = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.2/icons/' + (escuro ? 'sun.svg' : 'moon.svg');
}

botaoTema.addEventListener('click', function () {
    const novoTema = localStorage.getItem('tema') === 'escuro' ? 'claro' : 'escuro';
    localStorage.setItem('tema', novoTema);
    mostrarTema();
});

mostrarTema();
mostrarTotalCarrinho();

document.querySelectorAll('.adicionar').forEach(function (botao) {
    botao.addEventListener('click', function () {
        const id = botao.dataset.id;
        const carrinho = lerCarrinho();
        carrinho[id] = (carrinho[id] || 0) + 1;
        salvarCarrinho(carrinho);
        document.getElementById('aviso-produto').textContent = produtos[id].nome + ' foi adicionado ao carrinho.';
    });
});

const buscaProdutos = document.getElementById('busca-produtos');

if (buscaProdutos) {
    const parametros = new URLSearchParams(window.location.search);
    buscaProdutos.value = parametros.get('busca') || '';

    function filtrarProdutos() {
        const termo = buscaProdutos.value.trim().toLowerCase();
        let encontrados = 0;

        document.querySelectorAll('.produto').forEach(function (produto) {
            produto.hidden = !produto.textContent.toLowerCase().includes(termo);

            if (!produto.hidden) {
                encontrados++;
            }
        });

        document.getElementById('aviso-produto').textContent = encontrados === 0 ? 'Nenhum produto encontrado.' : '';
    }

    buscaProdutos.addEventListener('input', filtrarProdutos);
    filtrarProdutos();
}

const itensCarrinho = document.getElementById('itens-carrinho');

if (itensCarrinho) {
    function mostrarCarrinho() {
        const carrinho = lerCarrinho();
        let total = 0;
        itensCarrinho.innerHTML = '';

        for (const id in carrinho) {
            if (!produtos[id] || carrinho[id] < 1) {
                continue;
            }

            total += produtos[id].preco * carrinho[id];
            const item = document.createElement('article');
            item.className = 'item-carrinho';
            item.innerHTML = '<div><h2>' + produtos[id].nome + '</h2><p>' + dinheiro(produtos[id].preco) + ' cada</p></div>' +
                '<div class="controles"><button class="diminuir" data-id="' + id + '" type="button">-</button>' +
                '<strong>' + carrinho[id] + '</strong>' +
                '<button class="aumentar" data-id="' + id + '" type="button">+</button></div>';
            itensCarrinho.appendChild(item);
        }

        if (total === 0) {
            itensCarrinho.innerHTML = '<div class="vazio"><h2>O carrinho esta vazio</h2><p>Escolha alguma coisa boa no cardapio.</p><a href="produtos.html">Ver cardapio</a></div>';
        }

        document.getElementById('total-preco').textContent = dinheiro(total);
        document.getElementById('finalizar-pedido').disabled = total === 0;

        document.querySelectorAll('.aumentar').forEach(function (botao) {
            botao.addEventListener('click', function () {
                mudarQuantidade(botao.dataset.id, 1);
            });
        });

        document.querySelectorAll('.diminuir').forEach(function (botao) {
            botao.addEventListener('click', function () {
                mudarQuantidade(botao.dataset.id, -1);
            });
        });
    }

    function mudarQuantidade(id, mudanca) {
        const carrinho = lerCarrinho();
        carrinho[id] += mudanca;

        if (carrinho[id] <= 0) {
            delete carrinho[id];
        }

        salvarCarrinho(carrinho);
        mostrarCarrinho();
    }

    document.getElementById('finalizar-pedido').addEventListener('click', function () {
        const carrinho = lerCarrinho();
        const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        let total = 0;

        for (const id in carrinho) {
            if (produtos[id]) {
                total += produtos[id].preco * carrinho[id];
            }
        }

        if (total === 0) {
            return;
        }

        const usuario = JSON.parse(localStorage.getItem('usuario'));

        if (!usuario || sessionStorage.getItem('logado') !== 'sim') {
            window.location.href = 'entrar.html';
            return;
        }

        const hoje = new Date();
        const pedido = {
            id: Date.now(),
            itens: carrinho,
            total: total,
            data: hoje.toLocaleDateString('pt-BR'),
            cliente: {
                nome: usuario.nome,
                email: usuario.email,
                telefone: usuario.telefone,
                endereco: usuario.endereco
            }
        };

        pedidos.push(pedido);
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        const arquivo = new Blob([JSON.stringify(pedido, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(arquivo);
        link.download = 'pedido-' + pedido.id + '.json';
        link.click();
        salvarCarrinho({});
        window.location.href = 'pedidos.html';
    });

    mostrarCarrinho();
}

const listaPedidos = document.getElementById('lista-pedidos');

if (listaPedidos) {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];

    if (pedidos.length === 0) {
        listaPedidos.innerHTML = '<div class="sem-pedidos"><h2>Nenhum pedido por aqui</h2><p>Quando voce finalizar um pedido, ele aparece nesta pagina.</p><a href="produtos.html">Ver cardapio</a></div>';
    }

    pedidos.slice().reverse().forEach(function (pedido, indice) {
        const caixa = document.createElement('article');
        const titulo = document.createElement('div');
        const lista = document.createElement('ul');
        const total = document.createElement('strong');
        caixa.className = 'pedido';
        titulo.className = 'pedido-topo';
        titulo.innerHTML = '<h2>Pedido ' + (pedidos.length - indice) + '</h2><p>' + pedido.data + '</p>';

        for (const id in pedido.itens) {
            if (produtos[id]) {
                const linha = document.createElement('li');
                linha.textContent = pedido.itens[id] + ' x ' + produtos[id].nome;
                lista.appendChild(linha);
            }
        }

        total.textContent = 'Total dos produtos: ' + dinheiro(pedido.total);
        caixa.appendChild(titulo);
        caixa.appendChild(lista);
        caixa.appendChild(total);
        listaPedidos.appendChild(caixa);
    });
}

const formCadastro = document.getElementById('form-cadastro');

if (formCadastro) {
    const telefone = document.getElementById('telefone-cadastro');
    const cep = document.getElementById('cep-cadastro');
    ligarMascaras(telefone, cep);

    formCadastro.addEventListener('submit', function (evento) {
        evento.preventDefault();
        const aviso = document.getElementById('aviso-cadastro');

        if (somenteNumeros(telefone.value).length !== 11 || somenteNumeros(cep.value).length !== 8) {
            aviso.textContent = 'Confira o telefone e o CEP.';
            return;
        }

        const usuario = {
            nome: document.getElementById('nome-cadastro').value.trim(),
            email: document.getElementById('email-cadastro').value.trim(),
            telefone: telefone.value,
            cep: cep.value,
            endereco: document.getElementById('endereco-cadastro').value.trim(),
            senha: document.getElementById('senha-cadastro').value
        };

        localStorage.setItem('usuario', JSON.stringify(usuario));
        sessionStorage.setItem('logado', 'sim');
        window.location.href = 'perfil.html';
    });

    document.getElementById('form-entrar').addEventListener('submit', function (evento) {
        evento.preventDefault();
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const email = document.getElementById('email-entrar').value.trim();
        const senha = document.getElementById('senha-entrar').value;

        if (usuario && usuario.email === email && usuario.senha === senha) {
            sessionStorage.setItem('logado', 'sim');
            window.location.href = 'perfil.html';
        } else {
            document.getElementById('aviso-entrar').textContent = 'Email ou senha incorretos.';
        }
    });
}

const formPerfil = document.getElementById('form-perfil');

if (formPerfil) {
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!usuario || sessionStorage.getItem('logado') !== 'sim') {
        document.getElementById('perfil-vazio').hidden = false;
    } else {
        formPerfil.hidden = false;
        document.getElementById('nome-perfil').value = usuario.nome;
        document.getElementById('email-perfil').value = usuario.email;
        document.getElementById('telefone-perfil').value = usuario.telefone;
        document.getElementById('cep-perfil').value = usuario.cep;
        document.getElementById('endereco-perfil').value = usuario.endereco;
        ligarMascaras(document.getElementById('telefone-perfil'), document.getElementById('cep-perfil'));

        formPerfil.addEventListener('submit', function (evento) {
            evento.preventDefault();
            const telefone = document.getElementById('telefone-perfil').value;
            const cep = document.getElementById('cep-perfil').value;
            const aviso = document.getElementById('aviso-perfil');

            if (somenteNumeros(telefone).length !== 11 || somenteNumeros(cep).length !== 8) {
                aviso.textContent = 'Confira o telefone e o CEP.';
                return;
            }

            usuario.nome = document.getElementById('nome-perfil').value.trim();
            usuario.email = document.getElementById('email-perfil').value.trim();
            usuario.telefone = telefone;
            usuario.cep = cep;
            usuario.endereco = document.getElementById('endereco-perfil').value.trim();
            localStorage.setItem('usuario', JSON.stringify(usuario));
            aviso.textContent = 'Dados salvos neste navegador.';
        });

        document.getElementById('sair').addEventListener('click', function () {
            sessionStorage.removeItem('logado');
            window.location.href = 'entrar.html';
        });
    }
}
