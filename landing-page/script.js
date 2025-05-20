// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function () {
    // Menu Mobile
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Fechar menu ao clicar em um link
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Navbar com fundo ao rolar
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 0';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.padding = '20px 0';
            navbar.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.05)';
        }
    });

    // Tabs para features
    const featureTabs = document.querySelectorAll('.feature-tab');
    const featureDetails = document.querySelectorAll('.feature-detail');

    featureTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const targetFeature = this.getAttribute('data-feature');

            // Remover classes active
            featureTabs.forEach(tab => tab.classList.remove('active'));
            featureDetails.forEach(detail => detail.classList.remove('active'));

            // Adicionar classe active ao tab clicado
            this.classList.add('active');

            // Adicionar classe active ao detalhe correspondente
            document.getElementById(targetFeature).classList.add('active');
        });
    });

    // Controle do carousel de telas do app
    const phoneSlides = document.querySelectorAll('.phone-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.querySelector('.carousel-arrow.prev');
    const nextBtn = document.querySelector('.carousel-arrow.next');
    let currentSlide = 0;

    // Função para mostrar slide
    function showSlide(index) {
        phoneSlides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        phoneSlides[index].classList.add('active');
        dots[index].classList.add('active');
    }

    // Event listeners para os botões de navegação
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', function () {
            currentSlide = (currentSlide - 1 + phoneSlides.length) % phoneSlides.length;
            showSlide(currentSlide);
        });

        nextBtn.addEventListener('click', function () {
            currentSlide = (currentSlide + 1) % phoneSlides.length;
            showSlide(currentSlide);
        });
    }

    // Event listeners para os dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function () {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });

    // Alternar slides a cada 5 segundos
    setInterval(function () {
        if (phoneSlides.length > 0) {
            currentSlide = (currentSlide + 1) % phoneSlides.length;
            showSlide(currentSlide);
        }
    }, 5000);

    // Controle do slider de depoimentos
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const testimonialDots = document.querySelectorAll('.testimonial-dots .dot');
    const testimonialPrev = document.querySelector('.testimonial-arrow.prev');
    const testimonialNext = document.querySelector('.testimonial-arrow.next');
    let currentTestimonial = 0;

    // Função para mostrar depoimento
    function showTestimonial(index) {
        const testimonialSlider = document.querySelector('.testimonial-slider');
        const slideWidth = testimonialCards[0].offsetWidth + 30; // largura + gap

        testimonialSlider.style.transform = `translateX(-${index * slideWidth}px)`;

        testimonialDots.forEach(dot => dot.classList.remove('active'));
        testimonialDots[index].classList.add('active');
    }

    // Event listeners para os botões de navegação
    if (testimonialPrev && testimonialNext) {
        testimonialPrev.addEventListener('click', function () {
            currentTestimonial = (currentTestimonial - 1 + testimonialCards.length) % testimonialCards.length;
            showTestimonial(currentTestimonial);
        });

        testimonialNext.addEventListener('click', function () {
            currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
            showTestimonial(currentTestimonial);
        });
    }

    // Event listeners para os dots
    testimonialDots.forEach((dot, index) => {
        dot.addEventListener('click', function () {
            currentTestimonial = index;
            showTestimonial(currentTestimonial);
        });
    });

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', function () {
            // Fechar outros itens
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Alternar estado atual
            item.classList.toggle('active');
        });
    });

    // Animar elementos ao entrar na viewport
    const animateOnScroll = function () {
        const elementsToAnimate = [
            ...document.querySelectorAll('.benefit-card'),
            ...document.querySelectorAll('.step'),
            ...document.querySelectorAll('.feature-text'),
            ...document.querySelectorAll('.device-mockup'),
            ...document.querySelectorAll('.faq-item'),
            document.querySelector('.hero-content'),
            document.querySelector('.hero-image'),
            document.querySelector('.cta-content')
        ];

        elementsToAnimate.forEach(element => {
            if (!element) return;

            const elementPosition = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Se o elemento estiver visível na tela
            if (elementPosition.top < windowHeight * 0.9) {
                element.classList.add('visible');
            }
        });
    };

    // Chamar a função uma vez no carregamento
    animateOnScroll();

    // Adicionar event listener para scroll
    window.addEventListener('scroll', animateOnScroll);

    // Botões CTA
    const ctaButtons = document.querySelectorAll('.cta-button');

    ctaButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Scroll suave para a seção de contato
            const contactSection = document.getElementById('contato');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}); 