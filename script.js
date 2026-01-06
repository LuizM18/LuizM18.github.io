document.addEventListener('DOMContentLoaded', () => {
    // --- 1. LÓGICA DE OBSERVAÇÃO (SKILLS E FADE-IN) ---
    const skillBars = document.querySelectorAll('.skill-bar');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('skill-bar')) {
                    const progress = entry.target.dataset.progress;
                    entry.target.style.width = progress + '%';
                    observer.unobserve(entry.target);
                }
                if (entry.target.classList.contains('fade-in-up-on-scroll')) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            }
        });
    }, observerOptions);

    skillBars.forEach(bar => observer.observe(bar));
    document.querySelectorAll('section.fade-in-up-on-scroll').forEach(section => observer.observe(section));

    // --- 2. NOVA LÓGICA DE FORMULÁRIO (INTEGRADA COM WEB3FORMS) ---
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); 

            // Formatação dinâmica do assunto
            const userName = document.getElementById('name').value;
            const userSubject = document.getElementById('userSubject').value;
            const dynamicSubjectField = document.getElementById('dynamicSubject');
            if(dynamicSubjectField) {
                dynamicSubjectField.value = `PROJETO: ${userName} - ${userSubject}`;
            }

            // Estado de carregamento no botão
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Enviando...';

            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                if (response.status == 200) {
                    formMessage.className = "mt-3 text-center p-2 rounded alert alert-success";
                    formMessage.textContent = 'Mensagem enviada com sucesso! Em breve entrarei em contato.';
                    contactForm.reset();
                } else {
                    formMessage.className = "mt-3 text-center p-2 rounded alert alert-danger";
                    formMessage.textContent = 'Ops! Ocorreu um erro ao enviar.';
                }
            })
            .catch(error => {
                formMessage.className = "mt-3 text-center p-2 rounded alert alert-danger";
                formMessage.textContent = 'Erro de conexão com o servidor.';
            })
            .finally(() => {
                formMessage.classList.remove('d-none');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                setTimeout(() => {
                    formMessage.classList.add('d-none');
                }, 5000);
            });
        });
    }

    // --- 3. LÓGICA DA TIMELINE E OUTROS ---
    function handleScrollTimeline() {
        const containers = document.querySelectorAll('.timeline-container');
        containers.forEach(container => {
            const rect = container.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.75 && rect.bottom >= 0) {
                container.classList.add('is-visible');
            }
        });
    }
    window.addEventListener('scroll', handleScrollTimeline);
    handleScrollTimeline();
});

// Animação GSAP
gsap.to(".me-2", {
    rotation: 360,
    duration: 3,
    ease: "none",
    repeat: -1
});
