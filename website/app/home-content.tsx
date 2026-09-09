import { ContactButton, FAQ, FloatingApply, Programs, Team } from './sections';
import { Hero } from './hero';
import { PageMotion } from './page-motion';
import { MobileMenu } from './mobile-menu';
import { FloatingHeader } from './floating-header';
import { attentionStatement } from '@/lib/hero-content';
const A = '/assets/';

function Logo() {
  return (
    <a className="logo" href="#top" aria-label="Morim Foundation home">
      morim foundation
    </a>
  );
}

export function MorimPage({
  heroVariant = 'original',
}: {
  heroVariant?: 'original' | 'context';
}) {
  return (
    <main id="top" data-hero-variant={heroVariant}>
      <PageMotion />
      <FloatingHeader>
        <Logo />
        <nav aria-label="Main navigation">
          <a href="#approach">Approach</a>
          <a href="#fellowship">Fellowship</a>
          <a href="#team">Team</a>
          <a href="#faq">FAQ</a>
        </nav>
        <ContactButton />
        <MobileMenu />
      </FloatingHeader>
      <Hero variant={heroVariant} />
      <section className="approach" id="approach" aria-label="Our approach">
        <div className="prose introduction">
          {heroVariant === 'original' && (
            <p data-hero-story-end>{attentionStatement}</p>
          )}
          <p>
            Schools were never designed to handle that.
            <br />
            Our foundation was.
          </p>
        </div>
        <figure className="pilot" id="pilot">
          <div className="photo-stack">
            <img
              className="pilot-landscape"
              src={`${A}img2607180000709000081.png`}
              alt="Teachers in discussion at the foundation’s Tbilisi pilot"
              width="511"
              height="339"
            />
            <img
              className="pilot-portrait"
              src={`${A}img2607180000709000022.png`}
              alt="Participants working on an activity during the Tbilisi pilot"
              width="317"
              height="412"
            />
          </div>
          <figcaption>
            Our first pilot in Tbilisi, Georgia. July 2026
          </figcaption>
        </figure>
        <div className="mission">
          <div className="prose">
            <p className="mission-intro">
              The Foundation runs programs for teachers and coordinators, and
              equip them with{' '}
              <span className="mentor-highlight">
                mentors
                <img src={`${A}imgRectangle70.svg`} alt="" aria-hidden="true" />
              </span>{' '}
              and{' '}
              <span className="funding">
                funding
                <span className="funding-underline" aria-hidden="true" />
              </span>
              .<span className="stipend-note">Yes, monthly stipend</span>
            </p>
            <p>
              More than half of every program is practice. The toolkit is
              curated: an inquiry stance, structured discussion formats,
              classroom craft, mentored practice with real children.
            </p>
            <p>
              We don’t have a new pedagogy to sell, and want it to work
              <br className="desktop-break" /> in a regular class of 35 on a
              Tuesday morning.
            </p>
            <p>
              Decades of research on teacher development agree on this. What
              changes classrooms isn’t lecture hours — it’s standards, coaching,
              and teachers learning together.
            </p>
          </div>
        </div>
      </section>
      <div className="story-stack">
        <section
          className="fellowship panel"
          id="fellowship"
          aria-labelledby="fellowship-title"
        >
          <FloatingApply />
          <p className="eyebrow">Morim fellows</p>
          <h2 className="display" id="fellowship-title">
            dear te
            <span className="glyph teacher-a">
              <span className="sr-only">a</span>
              <img src={`${A}imgA1.svg`} alt="" width="73" height="66" />
            </span>
            chers,
          </h2>
          <div className="prose fellowship-intro">
            <p>
              You see the results of years of classroom disruption better than
              anyone, and you’ve been left to face it alone. We want to give you
              tools, time and backing — and the respect your work deserves.
            </p>
            <p>
              We work where the leverage is highest: the late primary and early
              middle school years, before motivation fades. Joining our
              fellowship would give you:
            </p>
          </div>
          <div className="benefits">
            <article className="benefit craft">
              <h3>Crash-course into the hardest parts of the craft</h3>
              <p>
                Intensives where we explore and try specific teaching practices,
                then several weeks of teaching children, with a weekly mentor
                debrief
              </p>
              <div className="questions" aria-label="Questions we explore">
                <span>
                  “how do you build motivation that doesn’t depend on grades?”
                </span>
                <span>“how do you start a lesson with a real question?”</span>
                <span>
                  “how do you get a class’s attention without raising your
                  voice?”
                </span>
              </div>
            </article>
            <article className="benefit">
              <h3>Weekly mentorship sessions</h3>
              <p>For the reflection and lessons that go sideways.</p>
            </article>
            <article className="benefit">
              <h3>Participant’s stipend</h3>
              <p>
                You have more than enough work without us, so we pay
                participants a stipend — both for the training and for the
                practice with children.
              </p>
            </article>
          </div>
          <Programs />
        </section>
        <section
          className="leaders panel"
          id="leaders"
          aria-labelledby="leaders-title"
        >
          <FloatingApply />
          <p className="eyebrow muted">Morim leaders</p>
          <h2 className="display" id="leaders-title">
            dear sch
            <span className="glyph school-oo">
              <span className="sr-only">oo</span>
              <img src={`${A}imgVector1.svg`} alt="" width="106" height="60" />
            </span>
            l<br />
            leaders,
          </h2>
          <div className="prose leaders-intro">
            <p>
              Strong teachers need schools where they can do good work and want
              to stay. That’s why we want to work not only with teachers, but
              also for people who shape the teams around them.
            </p>
            <p>
              In fall 2026, we’re launching a pilot program, where we’ll focus
              on:
            </p>
          </div>
          <div className="leader-benefits">
            {[
              'Leading people who don’t formally report to you',
              'Giving feedback people can actually use',
              'Distributing the workload across the team, and making time for everyone to grow',
            ].map((title) => (
              <article className="benefit" key={title}>
                <h3>{title}</h3>
                <p>
                  Intensives where we explore and try specific teaching
                  practices, then several weeks of teaching children, with a
                  weekly mentor debrief
                </p>
              </article>
            ))}
          </div>
          <Programs audience="leaders" />
        </section>
      </div>
      <Team />
      <FAQ />
      <footer id="contact" className="site-footer">
        <div className="footer-message">
          <h2>We help teachers shape next generation of children</h2>
          <ContactButton className="button rounded-button" />
        </div>
        <div className="footer-links">
          <div>
            <p className="footer-label">Foundation</p>
            <nav aria-label="Footer navigation">
              <a href="#approach">Approach</a>
              <a href="#fellowship">Fellowship</a>
              <a href="#team">Team</a>
              <a href="#faq">FAQ</a>
            </nav>
          </div>
          <div>
            <p className="footer-label">Socials</p>
            <nav aria-label="Social links">
              <ContactButton
                label="LinkedIn"
                kind="social"
                className="text-button"
              />
              <ContactButton
                label="Instagram"
                kind="social"
                className="text-button"
              />
              <ContactButton label="X" kind="social" className="text-button" />
            </nav>
          </div>
          <div className="footer-legal">
            <Logo />
            <p>
              © 2026, The Foundation for Teachers Growth LTD
              <br />
              Company Number: 517356374
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
