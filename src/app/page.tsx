"use client";

import Link from "next/link";
import { ArrowUpRight, CarFront, Clock3, Compass, MapPin, Plane, ShieldCheck, UsersRound } from "lucide-react";

const services = [
  { title: "City rides", detail: "Quick everyday journeys", href: "/book", icon: CarFront, tone: "lavender" },
  { title: "Airport taxi", detail: "On-time airport transfers", href: "/book", icon: Plane, tone: "peach" },
  { title: "Seat sharing", detail: "Share eligible intercity trips", href: "/seat-sharing", icon: UsersRound, tone: "lilac" },
  { title: "Hourly rentals", detail: "A cab for your plans", href: "/rentals", icon: Clock3, tone: "rose" },
];

export default function CustomerHome() {
  return (
    <main className="app-shell">
      <header className="home-header">
        <Link href="/" className="wordmark" aria-label="YREL home">YREL<span>.</span></Link>
        <div className="header-actions">
          <Link href="/login" className="login-link">Sign in</Link>
          <button className="language-button" type="button" aria-label="Language: English">EN <span>⌄</span></button>
        </div>
      </header>

      <section className="welcome-section">
        <div className="welcome-copy">
          <span className="overline"><span className="live-dot" /> YOUR JOURNEY, REIMAGINED</span>
          <h1>Go places.<br /><em>Feel the freedom.</em></h1>
          <p>Thoughtful rides for everyday plans, airport runs and journeys beyond your city.</p>
          <Link href="/book" className="hero-cta">Plan a ride <ArrowUpRight size={18} /></Link>
        </div>
        <div className="journey-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-sun" />
          <div className="route-line"><span /><span /><span /></div>
          <div className="art-car"><CarFront size={78} strokeWidth={1.35} /></div>
          <div className="art-pin pin-start"><MapPin size={19} /></div>
          <div className="art-pin pin-end"><Plane size={18} /></div>
          <div className="art-caption">YOUR NEXT<br />STOP AWAITS</div>
        </div>
      </section>

      <section className="quick-booking">
        <div className="quick-booking-copy">
          <span className="mini-label">READY WHEN YOU ARE</span>
          <strong>Where would you like to go?</strong>
          <small>Set your pickup and destination in a few taps.</small>
        </div>
        <Link href="/book" className="round-arrow" aria-label="Start booking"><ArrowUpRight size={22} /></Link>
      </section>

      <section className="services-section">
        <div className="section-title-row">
          <div><span className="mini-label">MADE FOR YOUR DAY</span><h2>Find your way</h2></div>
          <Link href="/menu" className="text-link">All services <ArrowUpRight size={15} /></Link>
        </div>
        <div className="service-grid">
          {services.map(({ title, detail, href, icon: Icon, tone }) => (
            <Link href={href} className="service-tile" key={title}>
              <span className={`service-icon ${tone}`}><Icon size={23} strokeWidth={1.8} /></span>
              <span className="service-title">{title}</span>
              <span className="service-detail">{detail}</span>
              <ArrowUpRight className="tile-arrow" size={17} />
            </Link>
          ))}
        </div>
      </section>

      <section className="promise-strip">
        <span className="promise-icon"><ShieldCheck size={21} /></span>
        <div><strong>Every ride, with clarity.</strong><p>Know your route and estimated fare before you send a booking request.</p></div>
      </section>

      <footer className="home-footer"><span>YREL<span className="footer-dot">.</span></span><small>Your city. Your ride. Your time.</small></footer>

      <nav className="bottom-navigation" aria-label="Main navigation">
        <Link href="/" className="nav-item active"><span>⌂</span>Home</Link>
        <Link href="/bookings" className="nav-item"><span>▤</span>Bookings</Link>
        <Link href="/saved" className="nav-item"><span>♡</span>Saved</Link>
        <Link href="/menu" className="nav-item"><span>☰</span>Menu</Link>
      </nav>
    </main>
  );
}
