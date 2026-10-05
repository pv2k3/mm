import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, animate, motion, useInView, useScroll } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Instagram, MapPin, Menu, MessageCircle, Navigation, Phone, ShieldCheck, Star, Wrench, X, Youtube, Zap } from 'lucide-react';
import './styles.css';

const Car3D = lazy(() => import('./Car3D.jsx'));
const BASE = import.meta.env.BASE_URL;
const img = (name) => `${BASE}assets/img/${name}.webp`;

/* ------------------------------------------------------------------ data */

// TODO(client): replace every value in BRAND with the real details before launch.
const BRAND = {
  whatsapp: '919999999999',
  phone: '+91 99999 99999',
  tel: '+919999999999',
  instagram: 'https://instagram.com/mm.motors.official',
  youtube: 'https://youtube.com/@mm.motors',
  address: 'Lucknow, Uttar Pradesh',
  // Placeholder pin in central Lucknow — swap for the branch's exact coordinates.
  lat: 26.8467,
  lng: 80.9462
};
const mapSrc = `https://www.google.com/maps?q=${BRAND.lat},${BRAND.lng}&z=15&output=embed`;
const mapDirections = `https://www.google.com/maps/dir/?api=1&destination=${BRAND.lat},${BRAND.lng}`;
const waLink = (text = "Namaste MM Motors! I'd like to know more about your services.") => `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;

const services = [
  { title: 'Denting & Painting', hi: 'डेंटिंग व पेंटिंग', kicker: 'RESTORE', image: img('svc-paint'), copy: 'Panel correction, precision paint matching and finish restoration for a factory-fresh look.' },
  { title: 'Complete Car Servicing', hi: 'पूरी कार सर्विसिंग', kicker: 'MAINTAIN', image: img('svc-service'), copy: 'Periodic maintenance, diagnostics, fluids, filters and preventive checks under one roof.' },
  { title: 'Car Washing & Detailing', hi: 'वॉशिंग व डिटेलिंग', kicker: 'REFINE', image: img('svc-detail'), copy: 'Deep cleaning, paint correction and detailing treatments that make every surface count.' },
  { title: 'Repairs & Modifications', hi: 'रिपेयर व मॉडिफिकेशन', kicker: 'UPGRADE', image: img('svc-repair'), copy: 'Mechanical repairs, performance upgrades and tasteful modifications engineered for the road.' },
  { title: 'Buy / Sell / Exchange', hi: 'पुरानी गाड़ी खरीद-बिक्री', kicker: 'MOVE', image: img('svc-sell'), copy: 'Explore old and second-hand cars with a transparent, workshop-backed approach.' }
];
const testimonials = [
  ['“The finish was genuinely showroom-level. The team explained every step instead of just handing me a bill.”', 'Aarav S.', 'Hyundai Creta'],
  ['“Dropped the Swift for service and detailing. Turnaround was quick and they kept me updated on WhatsApp.”', 'Riya M.', 'Maruti Swift'],
  ['“From diagnosis to the final delivery, MM Motors felt premium without feeling intimidating.”', 'Kunal V.', 'Mahindra Thar']
];
const gallery = [
  ['The workshop', img('workshop')],
  ['Paint & dent', img('svc-paint')],
  ['Detailing', img('svc-detail')],
  ['Servicing', img('svc-service')],
  ['Repairs', img('svc-repair')],
  ['Used cars', img('svc-sell')]
];
const whyItems = [
  ['01', 'Expert technicians', 'Hands-on experience across service, repair, detailing and modifications.', Wrench],
  ['02', 'Modern equipment', 'A workshop environment designed around accurate diagnosis and clean execution.', Zap],
  ['03', 'Transparent pricing', 'Clear scopes, clear communication and no surprise additions.', ShieldCheck],
  ['04', 'Quick turnaround', 'Efficient workflows that respect your time without rushing the work.', Clock3]
];
const trust = ['Precision service', 'Premium finish', 'Clear communication', 'Built for your drive'];
const makes = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota', 'Kia', 'Skoda'];
const paints = [['Racing Red', '#d4150c'], ['Pearl White', '#e9ebef'], ['Graphite', '#2b3038'], ['Deep Blue', '#1f4fbf']];
const navItems = [['About', 'about'], ['Services', 'services'], ['Gallery', 'gallery'], ['Why Us', 'why-us'], ['Contact', 'contact']];

/* ------------------------------------------------------------ components */

// Scroll-reveal wrapper. A single IntersectionObserver in <App> adds `.in`; CSS does the motion.
function Rv({ as: Tag = 'div', i = 0, className = '', children, ...rest }) {
  return <Tag className={`rv ${className}`} style={{ '--i': i }} {...rest}>{children}</Tag>;
}

// "|" = line break, a leading "*" marks an accent word.
function Title({ as: Tag = 'h2', t, className = '' }) {
  return (
    <Tag className={`title rv ${className}`}>
      {t.split('|').map((line, i) => (
        <span className="tl" key={i}>
          {line.split(' ').map((w, j) => (w.startsWith('*') ? <em key={j}>{w.slice(1)} </em> : <React.Fragment key={j}>{w} </React.Fragment>))}
        </span>
      ))}
    </Tag>
  );
}

function Loader({ onDone }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 5)), 40);
    const done = setTimeout(onDone, 950);
    return () => { clearInterval(t); clearTimeout(done); };
  }, [onDone]);
  return (
    <motion.div className="loader" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
      <div className="loader-mark">MM</div>
      <div className="loader-meta mono"><span>MM MOTORS / LUCKNOW</span><span>{String(progress).padStart(3, '0')}%</span></div>
      <div className="loader-bar"><div style={{ transform: `scaleX(${progress / 100})` }} /></div>
    </motion.div>
  );
}

function Counter({ value, label, suffix = '+' }) {
  const ref = useRef(null);
  const num = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  useEffect(() => {
    if (!inView) return;
    // write straight to the DOM: no React re-render per frame
    const controls = animate(0, value, { duration: 1.6, ease: [0.22, 0.8, 0.24, 1], onUpdate: (v) => { if (num.current) num.current.textContent = Math.round(v).toLocaleString('en-IN'); } });
    return () => controls.stop();
  }, [inView, value]);
  return (
    <div ref={ref} className="counter">
      <strong><span ref={num}>0</span><em>{suffix}</em></strong>
      <span className="mono">{label}</span>
    </div>
  );
}

function BeforeAfter() {
  const wrap = useRef(null);
  const set = (v) => wrap.current?.style.setProperty('--p', `${v}%`);
  return (
    <div className="ba" ref={wrap} style={{ '--p': '50%' }}>
      <img src={img('ba')} alt="Glossy car after detailing" loading="lazy" />
      <div className="ba-before"><img src={img('ba')} alt="" loading="lazy" /></div>
      <input aria-label="Drag to compare before and after detailing" type="range" min="0" max="100" defaultValue="50" onInput={(e) => set(e.target.value)} />
      <div className="ba-handle"><span>↔</span></div>
      <span className="ba-label mono before-label">BEFORE</span>
      <span className="ba-label mono after-label">AFTER</span>
    </div>
  );
}

/* ------------------------------------------------------------------- app */

function App() {
  const [loaded, setLoaded] = useState(false);
  const [menu, setMenu] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [slide, setSlide] = useState(0);
  const [paint, setPaint] = useState(paints[0][1]);
  const [active, setActive] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [sent, setSent] = useState(false);
  const onDone = useCallback(() => { window.scrollTo(0, 0); setLoaded(true); }, []);
  const { scrollYProgress } = useScroll();

  // scroll reveals: one observer, CSS transitions
  useEffect(() => {
    if (!loaded) return;
    const els = Array.from(document.querySelectorAll('.rv'));
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [loaded]);

  // active nav link + solid nav on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' });
    ['home', ...navItems.map(([, id]) => id), 'booking'].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => { window.removeEventListener('scroll', onScroll); io.disconnect(); };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % testimonials.length), 7000);
    return () => clearInterval(id);
  }, [slide]);

  // mobile menu: lock page scroll behind it, close on Esc or when the layout switches to desktop
  useEffect(() => {
    if (!menu) return;
    document.body.style.overflow = 'hidden';
    const esc = (e) => e.key === 'Escape' && setMenu(false);
    const resize = () => window.innerWidth >= 1024 && setMenu(false);
    window.addEventListener('keydown', esc);
    window.addEventListener('resize', resize);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc); window.removeEventListener('resize', resize); };
  }, [menu]);

  useEffect(() => {
    if (!lightbox) return;
    const esc = (e) => e.key === 'Escape' && setLightbox(null);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [lightbox]);

  // WhatsApp-first booking: the form opens a pre-filled chat
  const submit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const msg = `Namaste MM Motors! I'd like to book a service.\nName: ${f.get('name')}\nPhone: ${f.get('phone')}\nCar: ${f.get('car') || '-'}\nService: ${f.get('service') || '-'}\nPreferred: ${f.get('date') || '-'} ${f.get('time') || ''}\nNote: ${f.get('note') || '-'}`;
    window.open(waLink(msg), '_blank', 'noopener');
    form.reset();
    setSent(true);
    setTimeout(() => setSent(false), 6000);
  };

  return (
    <div className="app">
      <AnimatePresence>{!loaded && <Loader key="loader" onDone={onDone} />}</AnimatePresence>
      <motion.div className="progress" style={{ scaleX: scrollYProgress }} />

      <header className={`nav${scrolled || menu ? ' scrolled' : ''}`}>
        <div className="nav-in">
          <a href="#home" className="brand" onClick={() => setMenu(false)}><span className="brand-mm">MM</span><span><b>MM MOTORS</b><small className="mono">LUCKNOW</small></span></a>
          <nav className={menu ? 'open' : ''} aria-label="Primary">
            {navItems.map(([label, id]) => <a key={id} href={'#' + id} className={active === id ? 'on' : ''} onClick={() => setMenu(false)}>{label}</a>)}
            <a href="#booking" className="btn btn-red nav-cta" onClick={() => setMenu(false)}>Book a service <ArrowUpRight size={16} /></a>
          </nav>
          <button className="menu" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
        </div>
      </header>

      {menu && <div className="scrim" onClick={() => setMenu(false)} aria-hidden="true" />}

      <main>
        {/* ---------------- hero ---------------- */}
        <section id="home" className="hero">
          <div className="hero-copy">
            <Rv as="p" className="eyebrow mono"><span />Lucknow / Automotive studio</Rv>
            <Title as="h1" t="BUILT FOR|*YOUR *DRIVE." className="hero-title" />
            <Rv as="p" i={2} className="lead mono">Repair <i>•</i> Modify <i>•</i> Upgrade</Rv>
            <Rv as="p" i={3} className="hindi" lang="hi">आपकी गाड़ी, हमारी ज़िम्मेदारी</Rv>
            <Rv as="p" i={3} className="sublead">Precision service. Bold modifications. A workshop experience designed around the way you drive.</Rv>
            <Rv i={4} className="actions">
              <a href="#booking" className="btn btn-red">Book a service <ArrowUpRight size={18} /></a>
              <a href="#services" className="btn btn-ghost">Explore services <ArrowDownRight size={18} /></a>
            </Rv>
          </div>

          <Rv i={2} className="car-stage">
            <div className="stage-inner">
              <Suspense fallback={<div className="model-loading mono">Loading 3D…</div>}><Car3D paint={paint} /></Suspense>
            </div>
            <div className="paint">
              <span className="mono">Paint</span>
              {paints.map(([name, hex]) => <button key={hex} className={paint === hex ? 'on' : ''} style={{ '--c': hex }} aria-label={name} aria-pressed={paint === hex} title={name} onClick={() => setPaint(hex)} />)}
            </div>
          </Rv>
        </section>

        <div className="trust-wrap">
          <Rv className="trust">{trust.map((x, i) => <div key={x}><span className="mono">0{i + 1}</span>{x}</div>)}</Rv>
          <Rv i={1} className="makes">
            <span className="mono">We work on</span>
            <ul>{makes.map((m) => <li key={m}>{m}</li>)}</ul>
          </Rv>
        </div>

        {/* ---------------- about ---------------- */}
        <section id="about" className="section about">
          <Rv className="section-tag mono">01 / The MM standard</Rv>
          <div className="about-grid">
            <Title t="Same Trust.|*Bigger *Space.|Better Facilities." />
            <Rv i={1} className="about-copy panel">
              <p>MM Motors is built for drivers who care about what happens after they hand over the keys. From everyday servicing to serious upgrades, every job gets the same obsession with detail.</p>
              <p className="tagline mono">Driven by passion, built to perform.</p>
              <a href="#contact" className="text-link mono">Meet the workshop <ArrowUpRight size={16} /></a>
            </Rv>
          </div>
          <Rv className="counters">
            <Counter value={2500} label="Cars serviced" />
            <Counter value={1800} label="Happy customers" />
            <Counter value={8} label="Years experience" />
            <Counter value={2} label="Branches" suffix="" />
          </Rv>
        </section>

        {/* ---------------- services ---------------- */}
        <section id="services" className="section services">
          <div className="section-head">
            <div><Rv className="section-tag mono">02 / What we do</Rv><Title t="Built to *move." /></div>
            <Rv as="p" i={1}>From paint correction to performance modifications, we keep the process clear and the finish uncompromising.</Rv>
          </div>
          <Rv as="ul" className="service-grid">
            {services.map((s, i) => (
              <li className="service-card" key={s.title}>
                <div className="service-media">
                  <img src={s.image} alt={s.title} loading="lazy" width="800" height="500" />
                  <span className="card-no mono">0{i + 1}</span>
                </div>
                <div className="service-content">
                  <span className="kicker mono">{s.kicker}</span>
                  <h3>{s.title}</h3>
                  <span className="hi" lang="hi">{s.hi}</span>
                  <p>{s.copy}</p>
                  <a className="card-link" href={`#booking`} aria-label={`Book ${s.title}`}>Book this <ArrowUpRight size={16} /></a>
                </div>
              </li>
            ))}
          </Rv>
        </section>

        {/* ---------------- branch ---------------- */}
        <section className="arrival">
          <div className="arrival-image"><img src={img('workshop')} alt="Inside a modern car workshop" loading="lazy" /></div>
          <div className="arrival-in">
            <Rv className="arrival-copy panel">
              <div className="section-tag mono">03 / New branch</div>
              <Title t="A new home|for *serious *cars." />
              <p>More space. Better equipment. The same MM Motors standard — now closer to the road you take every day.</p>
              <a href="#contact" className="btn btn-red">Visit us <MapPin size={17} /></a>
            </Rv>
          </div>
        </section>

        {/* ---------------- gallery ---------------- */}
        <section id="gallery" className="section gallery">
          <div className="section-head">
            <div><Rv className="section-tag mono">04 / The work</Rv><Title t="See the *difference." /></div>
            <Rv as="p" i={1}>Stock photography stands in for now — swap in your own workshop shots and customer cars.</Rv>
          </div>
          <Rv className="gallery-grid">
            {gallery.map(([title, src], i) => (
              <button className={`gallery-item g${i + 1}`} key={title} onClick={() => setLightbox(src)} aria-label={`Open ${title}`}>
                <img src={src} alt={title} loading="lazy" />
                <span className="mono">{title}</span>
              </button>
            ))}
          </Rv>
        </section>

        {/* ---------------- why ---------------- */}
        <section id="why-us" className="section why">
          <Rv className="section-tag mono">05 / Why MM</Rv>
          <div className="why-grid">
            <Title t="Workshop|*without|the guesswork." />
            <Rv i={1} className="why-list">
              {whyItems.map(([n, t, c, Icon]) => (
                <div className="why-row panel" key={n}>
                  <span className="why-icon"><Icon size={22} /></span>
                  <div><h3><b className="mono">{n}</b>{t}</h3><p>{c}</p></div>
                </div>
              ))}
            </Rv>
          </div>
        </section>

        {/* ---------------- testimonials ---------------- */}
        <section className="section testimonials">
          <div className="section-head">
            <div><Rv className="section-tag mono">06 / Driver stories</Rv><Title t="Good work gets *noticed." /></div>
            <Rv i={1} className="carousel-controls">
              <button aria-label="Previous story" onClick={() => setSlide((slide + testimonials.length - 1) % testimonials.length)}><ChevronLeft /></button>
              <button aria-label="Next story" onClick={() => setSlide((slide + 1) % testimonials.length)}><ChevronRight /></button>
            </Rv>
          </div>
          <Rv className="quote-stage">
            <AnimatePresence mode="wait">
              <motion.div key={slide} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="quote-card panel">
                <div className="stars" aria-label="5 out of 5 stars">{[0, 1, 2, 3, 4].map((s) => <Star key={s} size={18} />)}</div>
                <blockquote>{testimonials[slide][0]}</blockquote>
                <div className="quote-by"><b>{testimonials[slide][1]}</b><span className="mono">{testimonials[slide][2]}</span></div>
              </motion.div>
            </AnimatePresence>
            <div className="dots">{testimonials.map((_, i) => <button key={i} className={i === slide ? 'on' : ''} aria-label={`Story ${i + 1}`} onClick={() => setSlide(i)} />)}</div>
          </Rv>
        </section>

        {/* ---------------- before / after ---------------- */}
        <section className="section before-after">
          <div className="section-head">
            <div><Rv className="section-tag mono">07 / Detailing</Rv><Title t="Before. After.|*One *standard." /></div>
            <Rv as="p" i={1}>Drag the divider to preview the kind of finish the studio is built to deliver. Illustrative effect — replace with a real job photo pair.</Rv>
          </div>
          <Rv><BeforeAfter /></Rv>
        </section>

        {/* ---------------- booking ---------------- */}
        <section id="booking" className="section booking">
          <div className="booking-intro">
            <Rv className="section-tag mono">08 / Your next drive</Rv>
            <Title t="Let's get your|*car *right." />
            <Rv as="p" i={1}>Tell us what your car needs. We'll confirm your slot on WhatsApp.</Rv>
            <Rv i={2}><a className="btn btn-wa" href={waLink()} target="_blank" rel="noreferrer"><MessageCircle size={20} /> Chat on WhatsApp</a></Rv>
          </div>
          <Rv i={1} as="form" className="booking-form panel" onSubmit={submit}>
            <div className="form-grid">
              <label>Name<input name="name" required autoComplete="name" placeholder="Your name" /></label>
              <label>Phone<input name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 XXXXX XXXXX" /></label>
              <label>Car model<input name="car" placeholder="e.g. Maruti Swift" /></label>
              <label>Service<select name="service" defaultValue="">
                <option value="" disabled>Select service</option>{services.map((s) => <option key={s.title}>{s.title}</option>)}</select></label>
              <label>Preferred date<input name="date" type="date" /></label>
              <label>Preferred time<select name="time" defaultValue=""><option value="">Select time</option><option>10:00 AM</option><option>12:00 PM</option><option>3:00 PM</option><option>5:00 PM</option></select></label>
            </div>
            <label>What does your car need?<textarea name="note" rows="3" placeholder="Tell us briefly about the issue or upgrade..." /></label>
            <button className="btn btn-red submit" type="submit">Send on WhatsApp <ArrowUpRight size={18} /></button>
            <AnimatePresence>{sent && <motion.p className="sent" role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><CheckCircle2 size={18} /> WhatsApp opened with your details — send the message to confirm.</motion.p>}</AnimatePresence>
          </Rv>
        </section>

        {/* ---------------- contact + map ---------------- */}
        <section id="contact" className="section contact">
          <Rv className="section-tag mono">09 / Find MM Motors</Rv>
          <Title t="See you|*at *the *shop." />
          <div className="contact-grid">
            <div>
              <Rv className="contact-items">
                <p className="panel"><MapPin /><span><b>{BRAND.address}</b><small>Exact branch address — replace placeholder</small></span></p>
                <p className="panel"><Clock3 /><span><b>Mon — Sun / 10:00 AM — 8:00 PM</b><small>Hours may vary on public holidays</small></span></p>
                <a className="panel" href={`tel:${BRAND.tel}`}><Phone /><span><b>{BRAND.phone}</b><small>Tap to call · WhatsApp for appointments</small></span></a>
              </Rv>
              <Rv i={1} className="socials">
                <a className="panel" href={BRAND.instagram} target="_blank" rel="noreferrer"><Instagram size={18} /> Instagram</a>
                <a className="panel" href={BRAND.youtube} target="_blank" rel="noreferrer"><Youtube size={18} /> YouTube</a>
              </Rv>
            </div>
            <Rv i={1} className="map-card">
              <iframe title="MM Motors location map" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              <a className="btn btn-red map-cta" href={mapDirections} target="_blank" rel="noreferrer"><Navigation size={17} /> Get directions</a>
            </Rv>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-brand"><span className="brand-mm">MM</span><div><b>MM MOTORS</b><small className="mono">REPAIR • MODIFY • UPGRADE</small></div></div>
        <div className="footer-links"><a href="#home">Home</a><a href="#services">Services</a><a href="#gallery">Gallery</a><a href="#booking">Book</a></div>
        <p className="copy">© {new Date().getFullYear()} MM Motors, Lucknow. Built for your drive.<br />3D model: Ferrari 458 Italia by vicent091036 (via three.js examples).</p>
      </footer>

      {/* mobile quick-action bar */}
      <div className="dock" role="group" aria-label="Quick actions">
        <a href={`tel:${BRAND.tel}`}><Phone size={18} />Call</a>
        <a href={waLink()} target="_blank" rel="noreferrer"><MessageCircle size={18} />WhatsApp</a>
        <a href="#booking" className="primary"><ArrowUpRight size={18} />Book</a>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setLightbox(null)}>
            <button aria-label="Close preview"><X /></button>
            <motion.img initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }} src={lightbox} alt="MM Motors gallery preview" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Always open at the top, even on refresh: stop the browser restoring the old scroll position
// and drop any #section hash left in the URL.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);

document.documentElement.classList.add('js');
createRoot(document.getElementById('root')).render(<App />);
