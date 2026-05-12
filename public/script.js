const botao = document.querySelector(".botao-gerar");
const textarea = document.querySelector(".caixa-texto");
const codigo = document.querySelector(".bloco-codigo");
const iframe = document.querySelector(".resultado-codigo");

botao.addEventListener("click", async () => {
    const prompt = textarea.value;

    if (!prompt) {
        alert("Digite algo!");
        return;
    }

    botao.disabled = true;
    botao.textContent = "Gerando...";

    try {
        const resposta = await fetch("/api/gerar-sites", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ input: prompt }),
        });

        const data = await resposta.json();

        if (!resposta.ok || data.error) {
            throw new Error(data.error || "Resposta inválida do servidor.");
        }

        codigo.textContent = data.codigo;
        iframe.srcdoc = data.codigo;

    } catch (erro) {
        alert(`Erro: ${erro.message}`);
    }

    botao.disabled = false;
    botao.textContent = "Gerar ⚡️";
});

// Configurações do canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variáveis para armazenar as partículas
let particles = [];

// Função para criar partículas
function createParticle(x, y) {
    particles.push({
        x: x,
        y: y,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        radius: Math.random() * 5 + 1,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
}

// Função para atualizar as partículas
function updateParticles() {
    for (let i = 0; i < particles.length; i++) {
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;

        if (particles[i].x + particles[i].radius > canvas.width || particles[i].x - particles[i].radius < 0) {
            particles[i].vx *= -1;
        }

        if (particles[i].y + particles[i].radius > canvas.height || particles[i].y - particles[i].radius < 0) {
            particles[i].vy *= -1;
        }
    }
}

// Função para desenhar as partículas
function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        ctx.beginPath();
        ctx.arc(particles[i].x, particles[i].y, particles[i].radius, 0, 2 * Math.PI);
        ctx.fillStyle = particles[i].color;
        ctx.fill();
    }
}

// Função para criar partículas em torno do mouse
function createParticlesAroundMouse(event) {
    for (let i = 0; i < 1; i++) {
        createParticle(event.clientX, event.clientY);
    }
}

// Eventos
document.addEventListener('mousemove', createParticlesAroundMouse);
document.addEventListener('touchmove', createParticlesAroundMouse);

// Loop principal
function loop() {
    updateParticles();
    drawParticles();
    requestAnimationFrame(loop);
}
loop();
