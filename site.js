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

document.querySelectorAll('[data-testimonial-carousel]').forEach(carousel => {
  const slides = [...carousel.querySelectorAll('[data-testimonial-slide]')];
  const previousButton = carousel.querySelector('[data-testimonial-previous]');
  const nextButton = carousel.querySelector('[data-testimonial-next]');
  const currentLabel = carousel.querySelector('[data-testimonial-current]');
  let currentIndex = 0;

  const renderCarousel = () => {
    const compactLayout = window.matchMedia('(max-width: 760px)').matches;
    slides.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', String(compactLayout && index !== currentIndex));
    });
    currentLabel.textContent = String(currentIndex + 1);
  };

  previousButton?.addEventListener('click', () => {
    currentIndex = SiteHelpers.nextIndex(currentIndex, slides.length, -1);
    renderCarousel();
  });

  nextButton?.addEventListener('click', () => {
    currentIndex = SiteHelpers.nextIndex(currentIndex, slides.length, 1);
    renderCarousel();
  });

  window.matchMedia('(max-width: 760px)').addEventListener('change', renderCarousel);
  renderCarousel();
});

const eventsList = document.querySelector('[data-events-list]');
const eventsStatus = document.querySelector('[data-events-status]');

const eventRow = event => {
  const display = SiteHelpers.eventDisplay(event, window.calendarConfig.timeZone);
  const item = document.createElement('li');
  const date = document.createElement('div');
  const day = document.createElement('strong');
  const month = document.createElement('span');
  const details = document.createElement('div');
  const title = document.createElement('h3');
  const schedule = document.createElement('p');

  item.className = 'event-item';
  date.className = 'event-date';
  date.setAttribute('aria-hidden', 'true');
  day.textContent = display.day;
  month.textContent = display.month;
  details.className = 'event-details';
  title.textContent = display.title;
  
  // Clear standard textContent assignment and use line break
  schedule.textContent = display.dateLabel;
  schedule.appendChild(document.createElement('br'));
  schedule.appendChild(document.createTextNode(display.timeLabel));

  date.append(day, month);
  details.append(title, schedule);

  if (display.location) {
    const location = document.createElement('p');
    location.textContent = display.location;
    details.append(location);
  }

  item.append(date, details);
  return item;
};

const setEventsStatus = message => {
  if (eventsStatus) eventsStatus.textContent = message;
};

const loadEvents = async () => {
  if (!eventsList || !eventsStatus || !window.calendarConfig?.apiKey) return;

  try {
    const response = await fetch(SiteHelpers.calendarRequestUrl(window.calendarConfig, new Date()));
    if (!response.ok) throw new Error('Calendar request failed');

    const payload = await response.json();
    const events = SiteHelpers.selectUpcomingEvents(payload.items || [], new Date());
    eventsList.replaceChildren(...events.map(eventRow));
    setEventsStatus(SiteHelpers.calendarStatus(events));
  } catch {
    eventsList.replaceChildren();
    setEventsStatus(SiteHelpers.calendarStatus([], true));
  }
};

loadEvents();

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
