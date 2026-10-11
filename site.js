const contactEndpoint = 'https://us-east1-innerglowgo-development.cloudfunctions.net/contact';

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-navigation');

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  navigation?.setAttribute('data-open', String(!isOpen));
});

navigation?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    navigation.setAttribute('data-open', 'false');
  });
});

document.querySelectorAll('[data-carousel]').forEach(carousel => {
  const slides = [...carousel.querySelectorAll('[data-carousel-slide]')];
  const previousButton = carousel.querySelector('[data-carousel-previous]');
  const nextButton = carousel.querySelector('[data-carousel-next]');
  const currentLabel = carousel.querySelector('[data-carousel-current]');
  let currentIndex = 0;

  const renderCarousel = () => {
    slides.forEach((slide, index) => {
      const position = (index - currentIndex + slides.length) % slides.length;
      slide.dataset.position = String(position);
      slide.setAttribute('aria-hidden', String(position !== 0));
    });
    currentLabel.textContent = String(currentIndex + 1);
  };

  previousButton?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    renderCarousel();
  });

  nextButton?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    renderCarousel();
  });

  renderCarousel();
});

const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');

form?.addEventListener('submit', async event => {
  event.preventDefault();
  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const payload = {
    name: String(formData.get('name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    interest: String(formData.get('interest') ?? '').trim(),
    message: String(formData.get('message') ?? '').trim(),
    website: String(formData.get('website') ?? '').trim(),
  };

  if (!payload.name || !payload.email || !payload.interest || !payload.message) {
    status.textContent = 'Please complete each field before sending your inquiry.';
    status.dataset.state = 'error';
    return;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Sending…';
  status.textContent = '';
  status.dataset.state = '';

  try {
    const response = await fetch(contactEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Contact request failed.');

    form.reset();
    status.textContent = 'Thank you. Your inquiry has been sent.';
    status.dataset.state = 'success';
  } catch {
    status.textContent = 'We could not send your inquiry just now. Please try again shortly.';
    status.dataset.state = 'error';
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Send inquiry <span aria-hidden="true">→</span>';
  }
});
