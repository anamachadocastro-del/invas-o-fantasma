// VERSÃO CONSOLIDADA ATÉ A PARTE 7.
import { perguntas } from "./perguntas.js";
import { aleatorio, nome } from "./aleatorio.js";

// 1. Elementos que já aparecem no HTML do material.
const caixaPerguntas = document.querySelector(".caixa-perguntas");
const caixaAlternativas = document.querySelector(".caixa-alternativas");
const caixaResultado = document.querySelector(".caixa-resultado");
const textoResultado = document.querySelector(".texto-resultado");
const tituloResultado = document.querySelector(".titulo-resultado");
const botaoJogarNovamente = document.querySelector(".novamente-btn");
const telaInicial = document.querySelector(".tela-inicial");
const botaoIniciar = document.querySelector(".iniciar-btn");

// Elementos novos da tela de créditos.
const botaoCreditos = document.querySelector(".creditos-btn");
const telaCreditos = document.querySelector(".tela-creditos");
const botaoVoltarInicio = document.querySelector(".voltar-inicio-btn");

// 2. Estado da partida.
let atual = 0;
let historiaFinal = "";
let faseDaPartida = "inicio";

// 3. O jogo só começa quando o botão Iniciar é clicado.
botaoIniciar.addEventListener("click", iniciaJogo);
botaoJogarNovamente.addEventListener("click", reiniciaJogo);
botaoCreditos.addEventListener("click", mostraCreditos);
botaoVoltarInicio.addEventListener("click", reiniciaJogo);

function iniciaJogo() {
  reiniciaJogo();
  faseDaPartida = "jogando";
  telaInicial.style.display = "none";
  caixaPerguntas.style.display = "block";
  caixaAlternativas.style.display = "flex";
  mostraPergunta();
}

function reiniciaJogo() {
  // A tentativa anterior é descartada por completo.
  atual = 0;
  historiaFinal = "";
  faseDaPartida = "inicio";
  caixaPerguntas.textContent = "";
  caixaAlternativas.replaceChildren();
  tituloResultado.textContent = "";
  textoResultado.textContent = "";
  telaInicial.style.display = "block";
  caixaPerguntas.style.display = "none";
  caixaAlternativas.style.display = "none";
  caixaResultado.style.display = "none";
  telaCreditos.style.display = "none";
  botaoCreditos.style.display = "none";
  botaoJogarNovamente.style.display = "inline-block";
}

// 4. Exibe a pergunta da posição atual e cria seus botões.
function mostraPergunta() {
  const perguntaAtual = perguntas[atual];

  // Vitória somente quando uma etapa final é alcançada.
  if (perguntaAtual.final === "vitoria") {
    mostraVitoria(perguntaAtual.enunciado);
    return;
  }

  caixaPerguntas.textContent =
    perguntaAtual.enunciado.replace(/você/gi, nome);

  caixaAlternativas.replaceChildren();

  for (const alternativa of perguntaAtual.alternativas) {
    const botao = document.createElement("button");
    botao.textContent = alternativa.texto;
    botao.disabled = alternativa.disponivel === false;
    botao.addEventListener("click", function () {
      respostaSelecionada(alternativa);
    });
    caixaAlternativas.appendChild(botao);
  }
}

// 5. Lê a escolha e muda a posição atual.
function respostaSelecionada(opcaoSelecionada) {
  // Só é possível escolher durante uma partida em andamento.
  if (faseDaPartida !== "jogando") {
    return;
  }

  if (opcaoSelecionada.disponivel === false) {
    return;
  }

  // A derrota não precisa de uma posição em proxima.
  // Por isso, ela é tratada antes da conferência do destino numérico.
  if (opcaoSelecionada.tipo === "gameover") {
    const afirmacao = aleatorio(opcaoSelecionada.afirmacao);
    historiaFinal += afirmacao + " ";
    mostraGameOver(opcaoSelecionada.mensagem);
    return;
  }

  const destino = opcaoSelecionada.proxima;

  if (!Number.isInteger(destino) || perguntas[destino] === undefined) {
    console.error("Destino inválido:", destino);
    return;
  }

  const origem = perguntas[atual];
  const chegada = perguntas[destino];
  const mudouDeCaminho = origem.caminho !== chegada.caminho;

  // A primeira pergunta pode iniciar qualquer uma das narrativas.
  // Depois dela, só uma alternativa do tipo trocar pode mudar de caminho.
  if (atual !== 0 && mudouDeCaminho && opcaoSelecionada.tipo !== "trocar") {
    console.error("Mudança de caminho sem o tipo trocar.");
    return;
  }

  // Uma alternativa do tipo trocar deve apontar para outro caminho.
  if (opcaoSelecionada.tipo === "trocar" && !mudouDeCaminho) {
    console.error("A troca deve levar a outro caminho.");
    return;
  }

  const afirmacao = aleatorio(opcaoSelecionada.afirmacao);
  historiaFinal += afirmacao + " ";

  atual = destino;
  mostraPergunta();
}

function mostraGameOver(mensagem) {
  faseDaPartida = "gameover";
  caixaPerguntas.style.display = "none";
  caixaAlternativas.replaceChildren();
  caixaAlternativas.style.display = "none";
  caixaResultado.style.display = "block";
  tituloResultado.textContent = "GAME OVER";
  textoResultado.textContent =
    mensagem + "\n\nSuas escolhas nesta tentativa:\n" + historiaFinal;
  botaoJogarNovamente.textContent = "Recomeçar do início";
  botaoJogarNovamente.style.display = "inline-block";
  botaoCreditos.style.display = "none";
  telaCreditos.style.display = "none";
}

function mostraVitoria(mensagem) {
  // Esta função não pode transformar uma pergunta comum em vitória.
  if (faseDaPartida !== "jogando" || perguntas[atual].final !== "vitoria") {
    return;
  }

  faseDaPartida = "vitoria";
  caixaPerguntas.style.display = "none";
  caixaAlternativas.replaceChildren();
  caixaAlternativas.style.display = "none";
  caixaResultado.style.display = "block";
  tituloResultado.textContent = "THE END";
  textoResultado.textContent =
    mensagem + "\n\nSeu percurso nesta partida:\n" + historiaFinal;

  // Depois da vitória, o próximo passo é abrir os créditos.
  botaoJogarNovamente.style.display = "none";
  botaoCreditos.style.display = "inline-block";
  telaCreditos.style.display = "none";
}

function mostraCreditos() {
  // Game Over e perguntas comuns não dão acesso aos créditos.
  if (faseDaPartida !== "vitoria") {
    return;
  }

  faseDaPartida = "creditos";
  telaInicial.style.display = "none";
  caixaPerguntas.style.display = "none";
  caixaAlternativas.style.display = "none";
  caixaResultado.style.display = "none";
  telaCreditos.style.display = "block";
}

// Estado inicial da página.
reiniciaJogo();