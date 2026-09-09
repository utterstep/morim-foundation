import { heroApps } from '@/lib/hero-interaction';
import { attentionStatement } from '@/lib/hero-content';

const options = [
  {
    id: 'editorial',
    name: '01 — The editorial opening',
    note: 'Recommended. Let the words carry the opening; put the visual play further down the page.',
  },
  {
    id: 'people',
    name: '02 — People before platforms',
    note: 'Lead with real teaching and real people. The apps become context, not the foundation’s visual identity.',
  },
  {
    id: 'context',
    name: '03 — Apps in the margin',
    note: 'Keep the digital context, but contain it in a small, orderly supporting column.',
  },
  {
    id: 'response',
    name: '04 — Problem / response',
    note: 'A quiet two-part statement. The green panel introduces the foundation as the response.',
  },
];

function AppIndex() {
  return (
    <div className="direction-app-index">
      {heroApps
        .filter((_, i) => [1, 2, 3, 6].includes(i))
        .map((app) => (
          <span key={app.name}>
            <img src={app.src} alt="" width="44" height="44" />
            <span>{app.name}</span>
          </span>
        ))}
    </div>
  );
}

export default function HeroOptions() {
  return (
    <main className="hero-directions" id="top">
      <header className="directions-header">
        <a href="/" className="logo">
          morim foundation
        </a>
        <a href="/">Back to the website ↗</a>
      </header>
      <div className="directions-intro">
        <h1>Four quieter ways to begin.</h1>
        <p>
          Same foundation, more room for the message. These are separate hero
          proposals; the current desktop opening is unchanged.
        </p>
        <nav aria-label="Hero proposals">
          {options.map((option) => (
            <a key={option.id} href={`#${option.id}`}>
              {option.name}
            </a>
          ))}
        </nav>
      </div>
      {options.map((option) => (
        <section
          key={option.id}
          id={option.id}
          className={`direction direction-${option.id}`}
          aria-labelledby={`${option.id}-label`}
        >
          <div className="direction-caption">
            <h2 id={`${option.id}-label`}>{option.name}</h2>
            <p>{option.note}</p>
          </div>
          <div className="direction-canvas">
            <div className="direction-wordmark">morim foundation</div>
            <div className="direction-composition">
              <div className="direction-main-copy">
                <p className="direction-headline">
                  it’s not your fault that students ignore you
                </p>
                {option.id !== 'response' && (
                  <p className="direction-body">{attentionStatement}</p>
                )}
                {option.id === 'editorial' && (
                  <a className="direction-link" href="/#approach">
                    Our approach <span aria-hidden="true">↓</span>
                  </a>
                )}
              </div>
              {option.id === 'people' && (
                <figure className="direction-photo">
                  <img
                    src="/assets/img2607180000709000081.png"
                    alt="Teachers in discussion at the foundation’s Tbilisi pilot"
                    width="511"
                    height="339"
                  />
                  <figcaption>
                    Our first pilot in Tbilisi, Georgia. July 2026
                  </figcaption>
                </figure>
              )}
              {option.id === 'context' && (
                <aside className="direction-margin">
                  <p>An economy engineered to consume their attention.</p>
                  <AppIndex />
                </aside>
              )}
              {option.id === 'response' && (
                <div className="direction-response-copy">
                  <p>Schools were never designed to handle that.</p>
                  <p>Our foundation was.</p>
                  <a className="direction-link" href="/#fellowship">
                    Explore our programs <span aria-hidden="true">↗</span>
                  </a>
                </div>
              )}
            </div>
            {option.id === 'response' && (
              <p className="direction-body direction-footnote">
                {attentionStatement}
              </p>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
