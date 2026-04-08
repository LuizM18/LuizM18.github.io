document.addEventListener('DOMContentLoaded', () => {
    const SELECTORS = {
        skillBars: '.skill-bar',
        fadeSections: 'section.fade-in-up-on-scroll',
        timelineItems: '.timeline-container',
        contactForm: '#contactForm',
        formMessage: '#formMessage',
        subjectInput: '#userSubject',
        nameInput: '#name',
        dynamicSubject: '#dynamicSubject',
        projectCards: '.project-card',
        typewriter: '#typewriter',
        navbarLinks: '.nav-link-custom[href^="#"]',
        observedSections: 'section[id]'
    };

    const CSS_CLASSES = {
        visible: 'is-visible',
        expanded: 'expanded',
        loading: 'is-loading',
        active: 'active',
        alertBase: 'mt-3 text-center p-2 rounded alert',
        alertSuccess: 'alert-success',
        alertError: 'alert-danger',
        hidden: 'd-none'
    };

    // -----------------------------
    // 1. OBSERVERS (sections, skills, timeline)
    // -----------------------------
    const skillBars = document.querySelectorAll(SELECTORS.skillBars);
    const fadeSections = document.querySelectorAll(SELECTORS.fadeSections);
    const timelineItems = document.querySelectorAll(SELECTORS.timelineItems);

    const revealObserverOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const target = entry.target;

            if (target.matches(SELECTORS.skillBars)) {
                const progress = Number(target.dataset.progress) || 0;
                target.style.width = `${progress}%`;
                target.setAttribute('aria-valuenow', String(progress));
                observer.unobserve(target);
                return;
            }

            if (
                target.matches(SELECTORS.fadeSections) ||
                target.matches(SELECTORS.timelineItems)
            ) {
                target.classList.add(CSS_CLASSES.visible);
                observer.unobserve(target);
            }
        });
    }, revealObserverOptions);

    skillBars.forEach((bar) => {
        bar.style.width = '0%';
        bar.setAttribute('role', 'progressbar');
        bar.setAttribute('aria-valuemin', '0');
        bar.setAttribute('aria-valuemax', '100');
        bar.setAttribute('aria-valuenow', '0');
        revealObserver.observe(bar);
    });

    fadeSections.forEach((section) => revealObserver.observe(section));
    timelineItems.forEach((item) => revealObserver.observe(item));

    // -----------------------------
    // 2. NAVBAR ACTIVE STATE
    // -----------------------------
    const navbarLinks = document.querySelectorAll(SELECTORS.navbarLinks);
    const observedSections = document.querySelectorAll(SELECTORS.observedSections);
    const navbar = document.querySelector('.navbar-custom');

    const clearActiveLinks = () => {
        navbarLinks.forEach((link) => {
            link.classList.remove(CSS_CLASSES.active);
            link.removeAttribute('aria-current');
        });
    };

    const setActiveLinkById = (sectionId) => {
        if (!sectionId) return;

        const targetLink = document.querySelector(
            `${SELECTORS.navbarLinks}[href="#${sectionId}"]`
        );

        if (!targetLink) return;

        clearActiveLinks();
        targetLink.classList.add(CSS_CLASSES.active);
        targetLink.setAttribute('aria-current', 'page');
    };

    const updateActiveNavOnScroll = () => {
        if (!observedSections.length || !navbarLinks.length) return;

        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const activationLine = navbarHeight + 120;

        // Caso especial: hero/topo
        const heroSection = document.getElementById('hero');
        if (heroSection) {
            const heroRect = heroSection.getBoundingClientRect();
            if (heroRect.top <= activationLine && heroRect.bottom > activationLine) {
                setActiveLinkById('hero');
                return;
            }
        }

        let currentSectionId = '';

        observedSections.forEach((section) => {
            const rect = section.getBoundingClientRect();

            if (rect.top <= activationLine && rect.bottom > activationLine) {
                currentSectionId = section.id;
            }
        });

        if (currentSectionId) {
            setActiveLinkById(currentSectionId);
        }
    };

    // Atualiza ao clicar em links âncora da própria página
    navbarLinks.forEach((link) => {
        link.addEventListener('click', () => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;

            const sectionId = href.slice(1);
            setActiveLinkById(sectionId);
        });
    });

    window.addEventListener('scroll', updateActiveNavOnScroll, { passive: true });
    window.addEventListener('resize', updateActiveNavOnScroll);
    updateActiveNavOnScroll();

    // -----------------------------
    // 3. FORMULÁRIO (Web3Forms)
    // -----------------------------
    const contactForm = document.querySelector(SELECTORS.contactForm);
    const formMessage = document.querySelector(SELECTORS.formMessage);

    if (contactForm) {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const nameInput = document.querySelector(SELECTORS.nameInput);
        const subjectInput = document.querySelector(SELECTORS.subjectInput);
        const dynamicSubjectField = document.querySelector(SELECTORS.dynamicSubject);

        const setFormMessage = (type, message) => {
            if (!formMessage) return;

            formMessage.className = `${CSS_CLASSES.alertBase} ${
                type === 'success' ? CSS_CLASSES.alertSuccess : CSS_CLASSES.alertError
            }`;
            formMessage.textContent = message;
            formMessage.classList.remove(CSS_CLASSES.hidden);
        };

        const hideFormMessage = () => {
            if (!formMessage) return;
            formMessage.classList.add(CSS_CLASSES.hidden);
        };

        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!submitBtn || !nameInput || !subjectInput || !dynamicSubjectField) {
                console.error('Elementos essenciais do formulário não foram encontrados.');
                return;
            }

            const userName = nameInput.value.trim();
            const userSubject = subjectInput.value.trim();

            dynamicSubjectField.value = userSubject
                ? `PROJETO: ${userName} - ${userSubject}`
                : `PROJETO: ${userName}`;

            const originalBtnHTML = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.classList.add(CSS_CLASSES.loading);
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';

            try {
                const formData = new FormData(contactForm);
                const payload = Object.fromEntries(formData.entries());

                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    setFormMessage('success', 'Mensagem enviada com sucesso! Em breve entrarei em contato.');
                    contactForm.reset();
                } else {
                    setFormMessage('error', 'Ops! Ocorreu um erro ao enviar sua mensagem.');
                }
            } catch (error) {
                console.error('Erro no envio do formulário:', error);
                setFormMessage('error', 'Erro de conexão. Tente novamente em instantes.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.classList.remove(CSS_CLASSES.loading);
                submitBtn.innerHTML = originalBtnHTML;

                window.setTimeout(() => {
                    hideFormMessage();
                }, 5000);
            }
        });
    }

    // -----------------------------
    // 4. INTERAÇÃO DOS CARDS DE PROJETO
    // -----------------------------
    const projectCards = document.querySelectorAll(SELECTORS.projectCards);

    projectCards.forEach((card) => {
        const mainText = card.querySelector('.card-text');

        if (!mainText) return;

        card.addEventListener('click', (event) => {
            const clickedInteractiveElement = event.target.closest('a, button');

            if (clickedInteractiveElement) return;

            mainText.classList.toggle(CSS_CLASSES.expanded);
            card.setAttribute(
                'aria-expanded',
                String(mainText.classList.contains(CSS_CLASSES.expanded))
            );
        });

        card.addEventListener('keydown', (event) => {
            const isActivationKey = event.key === 'Enter' || event.key === ' ';

            if (!isActivationKey) return;
            if (event.target.closest('a, button')) return;

            event.preventDefault();
            mainText.classList.toggle(CSS_CLASSES.expanded);
            card.setAttribute(
                'aria-expanded',
                String(mainText.classList.contains(CSS_CLASSES.expanded))
            );
        });

        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', 'Expandir ou recolher descrição do projeto');
        card.setAttribute('aria-expanded', 'false');
    });

    // -----------------------------
    // 5. TYPEWRITER
    // -----------------------------
    const initTypewriter = () => {
        const el = document.querySelector(SELECTORS.typewriter);
        if (!el) return;

        let words = [];

        try {
            words = JSON.parse(el.getAttribute('data-words'));
        } catch (error) {
            console.error('Erro ao interpretar data-words do typewriter:', error);
            words = [
                'Desenvolvimento Full Stack',
                'Python e Automação'
            ];
        }

        if (!Array.isArray(words) || words.length === 0) return;

        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        const type = () => {
            const currentWord = words[wordIndex % words.length];

            if (isDeleting) {
                charIndex--;
            } else {
                charIndex++;
            }

            el.textContent = currentWord.slice(0, charIndex);

            let speed = isDeleting ? 45 : 90;

            if (!isDeleting && charIndex === currentWord.length) {
                speed = 1800;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex++;
                speed = 450;
            }

            window.setTimeout(type, speed);
        };

        type();
    };

    initTypewriter();
});