'use client';
import { useEffect, useRef, useState } from 'react';
import { useProgramMotion } from './page-motion';
import { watchProgramsViewport } from '@/lib/floating-apply';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
const A = '/assets/';

// Visibility follows available programs and the card's visible viewport share.
// The sticky rail lives inside the card, so later cards naturally cover it.
export function FloatingApply() {
  const rail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (rail.current) return watchProgramsViewport(rail.current);
  }, []);
  return (
    <div ref={rail} className="floating-apply-rail" inert>
      <ContactButton
        label="Apply"
        kind="apply"
        className="button apply-button floating-apply-button"
      />
    </div>
  );
}

export function ContactButton({
  label = 'Get in touch',
  className = 'button',
  kind = 'contact',
}: {
  label?: string;
  className?: string;
  kind?: 'contact' | 'apply' | 'social';
}) {
  return (
    <Dialog>
      <DialogTrigger className={className}>{label}</DialogTrigger>
      <DialogContent className="morim-dialog">
        <DialogTitle>
          {kind === 'apply'
            ? 'Applications'
            : kind === 'social'
              ? label
              : 'Get in touch'}
        </DialogTitle>
        <DialogDescription>
          {kind === 'apply'
            ? 'The application link will be added soon. Please check back for details about joining the program.'
            : kind === 'social'
              ? 'This profile link will be added soon.'
              : 'Our contact details will be added soon. Please check back to connect with the foundation.'}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

const locations = [
  { value: 'all', label: 'All locations' },
  { value: 'tel-aviv', label: 'Tel-Aviv, Israel' },
  { value: 'tbilisi', label: 'Tbilisi, Georgia' },
];
export function Programs({
  audience = 'teachers',
}: {
  audience?: 'teachers' | 'leaders';
}) {
  const [location, setLocation] = useState<string | null>('all');
  const { list, capture } = useProgramMotion(location);
  const programLocations =
    audience === 'leaders' ? locations.slice(0, 1) : locations;
  return (
    <div
      className="programs"
      id={audience === 'leaders' ? 'leaders-programs' : 'programs'}
    >
      <div className="program-heading">
        <h3>Our programs</h3>
        <Select
          value={location}
          onValueChange={(value) => {
            if (value === location) return;
            capture();
            setLocation(value);
          }}
          items={programLocations}
        >
          <SelectTrigger
            className="location-select"
            aria-label="Filter programs by location"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="location-options">
            {programLocations.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="program-list" ref={list} aria-live="polite">
        {audience === 'leaders' && (
          <article className="program-row" data-program="school-coordination">
            <h4>Coordinating a School: Team, Systems, Projects</h4>
            <p>
              <span>Where</span>To be announced
            </p>
            <p>
              <span>When</span>To be announced
            </p>
            <ContactButton
              label="Apply"
              kind="apply"
              className="button apply-button"
            />
          </article>
        )}
        {audience === 'teachers' &&
          (location === 'all' || location === 'tel-aviv') && (
            <article className="program-row" data-program="tel-aviv">
              <h4>
                Teaching in the
                <br />
                Attention Economy
              </h4>
              <p>
                <span>Where</span>Tel-Aviv, Israel
              </p>
              <p>
                <span>When</span>October 06 —13th
              </p>
              <ContactButton
                label="Apply"
                kind="apply"
                className="button apply-button"
              />
            </article>
          )}
        {audience === 'teachers' &&
          (location === 'all' || location === 'tbilisi') && <TbilisiResults />}
      </div>
      <p className="program-note">
        Not seeing your city on the list, but would like to participate?
        <br />
        <ContactButton
          label="Tell us a little bit about yourself"
          className="inline-button"
        />
        , and we’ll do our best to host an intensive
      </p>
    </div>
  );
}

function TbilisiResults() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible
      render={<article />}
      className="program-results-card"
      data-program="tbilisi"
      open={open}
      onOpenChange={setOpen}
    >
      <div className="program-row program-results-summary">
        <h4 id="tbilisi-program-title">
          Summer C
          <span className="glyph small-a">
            <span className="sr-only">a</span>
            <img src={`${A}imgA2.svg`} alt="" width="28" height="25" />
          </span>
          mp
          <br />
          in Tbilisi
        </h4>
        <p>
          <span>Where</span>Tbilisi, Georgia
        </p>
        <p>
          <span>When</span>July 2026
        </p>
        <CollapsibleTrigger className="button results-button">
          {open ? 'Collapse' : 'See results'}
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent
        className="program-results-content"
        role="region"
        aria-labelledby="tbilisi-program-title"
      >
        <div className="program-results-body">
          <figure
            className="program-results-photos"
            aria-label="Photos from the Tbilisi teacher intensive"
          >
            <img
              className="results-landscape"
              src={`${A}img2607180000709000081.png`}
              alt="Teachers in discussion during the Tbilisi intensive"
              width="511"
              height="339"
            />
            <img
              className="results-portrait"
              src={`${A}img2607180000709000022.png`}
              alt="Participants working together on a teaching activity"
              width="317"
              height="412"
            />
          </figure>
          <div className="program-results-copy">
            <p>
              In summer 2026, 17 teachers finished our first intensive. 16 of
              them are now continuing paid teaching practice with children and
              meet with a mentor every week; 14 of the 17 would recommend the
              program to colleagues.
            </p>
            <p>
              Two-thirds of the children we surveyed said they’d like to have
              lessons like these at school.
            </p>
            <p>
              That’s encouraging, but it’s still a small, unusually friendly
              setting. We’ll be much more convinced if the same thing happens in
              ordinary classrooms.
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function Team() {
  return (
    <section className="team" id="team" aria-labelledby="team-title">
      <p className="eyebrow">People behind the Foundation</p>
      <h2 className="team-title" id="team-title">
        foundation is built
        <br className="desktop-break" /> by people with years
        <br className="desktop-break" /> of experience
        <br className="desktop-break" /> in education
      </h2>
      <div
        className="team-track"
        tabIndex={0}
        role="region"
        aria-label="Foundation team"
      >
        <article className="person">
          <div
            className="portrait-placeholder"
            role="img"
            aria-label="Elena Bunina portrait pending"
          />
          <p className="person-role">Founder, Patron</p>
          <h3>Elena Bunina</h3>
          <p>
            Professor of Mathematics at Bar-Ilan University and head of{' '}
            <a
              href="https://academy.nebius.com/"
              target="_blank"
              rel="noreferrer"
            >
              Nebius Academy
            </a>
            .
          </p>
        </article>
        <article className="person">
          <div
            className="portrait-placeholder"
            role="img"
            aria-label="Vlad Stepanov portrait pending"
          />
          <p className="person-role">Managing Partner</p>
          <h3>Vlad Stepanov</h3>
          <p>
            Former CEO of{' '}
            <a href="https://gradarius.com/" target="_blank" rel="noreferrer">
              Gradarius
            </a>
            ; ex-CTO and Head of Informatika at Yandex Education. 13+ years in
            EdTech in the US and the CIS.
          </p>
        </article>
        {[0, 1].map((n) => (
          <article className="person" key={n}>
            <div
              className="portrait-placeholder"
              role="img"
              aria-label="Team portrait pending"
            />
            <p className="person-role">Lead Methodologist</p>
            <h3>Name Name</h3>
            <p>Description</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const questions = [
  {
    question: 'Can I drop out if I get tired?',
    answer: 'Participation and withdrawal details will be added soon.',
  },
  {
    question: 'How does the stipend work?',
    answer:
      'Participants receive a stipend for both the training and the practice with children. Amounts and payment details will be added with the program information.',
  },
  {
    question: 'I teach late middle school. Too late for me?',
    answer:
      'Our fellowship focuses on the late primary and early middle school years. Eligibility details for other year groups will be added soon.',
  },
];
export function FAQ() {
  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <h2 id="faq-title">FAQ</h2>
      <Accordion className="faq-list">
        {questions.map((item, i) => (
          <AccordionItem
            className="faq-item"
            key={item.question}
            value={String(i)}
          >
            <AccordionTrigger className="faq-trigger">
              {item.question}
              <span className="faq-chevron" aria-hidden="true">
                ›
              </span>
            </AccordionTrigger>
            <AccordionContent className="faq-answer">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
