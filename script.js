// script.js
document.addEventListener('DOMContentLoaded', () => {
    const skillBars = document.querySelectorAll('.skill-bar');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animar barras de progresso
                if (entry.target.classList.contains('skill-bar')) {
                    const progress = entry.target.dataset.progress;
                    entry.target.style.width = progress + '%';
                    observer.unobserve(entry.target); // Para animar apenas uma vez
                }
                // Fade-in-up para seções
                if (entry.target.classList.contains('fade-in-up-on-scroll')) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Para animar apenas uma vez
                }
            }
        });
    }, observerOptions);

    // Observar barras de progresso
    skillBars.forEach(bar => {
        observer.observe(bar);
    });

    // Observar seções para fade-in-up
    document.querySelectorAll('section.fade-in-up-on-scroll').forEach(section => {
        observer.observe(section);
    });

    // Lógica de submissão do formulário de contato (apenas frontend)
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o envio padrão do formulário

            // Simula um envio bem-sucedido
            formMessage.classList.remove('d-none', 'text-danger');
            formMessage.classList.add('text-success');
            formMessage.textContent = 'Mensagem enviada com sucesso! Em breve entrarei em contato.';

            // Limpa o formulário
            contactForm.reset();

            // Esconde a mensagem após 5 segundos
            setTimeout(() => {
                formMessage.classList.add('d-none');
            }, 5000);
        });
    }

    // Adiciona um evento de rolagem para ativar as classes de animação da timeline
    function handleScrollTimeline() {
        const containers = document.querySelectorAll('.timeline-container');
        containers.forEach(container => {
            const rect = container.getBoundingClientRect();
            // Ativa a animação se a seção estiver visível em 70% da viewport
            if (rect.top <= window.innerHeight * 0.75 && rect.bottom >= 0) {
                container.classList.add('is-visible');
            }
        });
    }
    window.addEventListener('scroll', handleScrollTimeline);
    handleScrollTimeline(); // Chama no carregamento para elementos já visíveis
});

// Este efeito é mais para fins visuais para garantir que a transição de largura seja percebida
// Se as barras de progresso não aparecerem animadas na primeira vez, é devido ao tempo de carregamento do JS.
// O IntersectionObserver já lida com a animação ao entrar na viewport.
