/**
 * About.jsx
 * About Us page — editorial magazine-style team layout (like reference image)
 *
 * ── IMAGE SETUP ──────────────────────────────────────────────────────────────
 * Place your photos in:   frontend/public/team_images/
 *   arjun.jpg   → /team_images/arjun.jpg
 *   priya.jpg   → /team_images/priya.jpg
 *   rahul.jpg   → /team_images/rahul.jpg
 *
 * Since public/ is served at the root by CRA, no imports needed.
 * The `photo` field below is the path React will use at runtime.
 * The `fallback` is a dummy image shown if the file is missing.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';

// ─── Team Data ────────────────────────────────────────────────────────────────
const TEAM = [
  {
    id: 1,
    number: '01',
    name: 'Arpit Kala',
    role: 'Backend Developer',
    description:
      'Architected the Node.js & Express REST API, MongoDB schemas, and JWT auth system that powers every feature of ChemLab.',
    // Path from frontend/public/team_images/
    photo: '/team_images/arpit.jpeg',
    // Dummy photo — shown until real file is placed in the folder above
    fallback: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 2,
    number: '02',
    name: 'Sushil Sethiya',
    role: 'Full Stack Developer',
    description:
      'Designed and built the complete React dashboard, component library, and responsive UI that makes ChemLab intuitive for every student.',
    photo: '/team_images/sushil.jpeg',
    fallback: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: 3,
    number: '03',
    name: 'Abhay Kumar Singh',
    role: 'MERN Stack Developer',
    description:
      'Created the visual identity, wireframes, and design system of ChemLab from scratch — every pixel placed with purpose.',
    photo: '/team_images/abhay.jpeg',
    fallback: 'https://randomuser.me/api/portraits/men/67.jpg',
  },
];

// ─── TeamCard ─────────────────────────────────────────────────────────────────
const TeamCard = ({ member, index }) => {
  const [imgSrc, setImgSrc] = React.useState(member.photo);

  return (
    <div className="about-card" style={{ animationDelay: `${index * 0.13}s` }}>
      {/* Portrait photo */}
      <div className="about-photo-wrap">
        <img
          src={imgSrc}
          alt={member.name}
          className="about-photo"
          onError={() => setImgSrc(member.fallback)}
        />
        {/* <span className="about-num-badge">{member.number}</span> */}
      </div>

      {/* Text */}
      <div className="about-card-body">
        <p className="about-role">{member.role}</p>
        <h3 className="about-name">{member.name}</h3>
        <p className="about-desc">{member.description}</p>
      </div>
    </div>
  );
};

// ─── About Page ───────────────────────────────────────────────────────────────
const About = () => (
  <div className="about-page animate-fade-in">

    {/* Header */}
    <div className="about-header">
      <p className="about-eyebrow">ABOUT</p>
      <h1 className="about-headline">
        The dream team of<br />
        <em>ChemLab.</em>
      </h1>
      <p className="about-tagline">We Build Better Lab Management. Together.</p>
    </div>

    {/* Cards */}
    <div className="about-grid">
      {TEAM.map((m, i) => <TeamCard key={m.id} member={m} index={i} />)}
    </div>

    {/* College footer */}
    <div className="about-footer">
      <span style={{ fontSize: 24 }}>🏫</span>
      <div>
        <p className="about-footer-name">Shri GS Institute of Technology &amp; Science, Indore</p>
        <p className="about-footer-sub">MERN Stack Project · ChemLab Management System</p>
      </div>
    </div>

    {/* Scoped styles */}
    <style>{`
      .about-page {
        max-width: 1000px;
        margin: 0 auto;
        padding: 4px 0 40px;
      }

      /* ── Header ── */
      .about-header {
        text-align: center;
        margin-bottom: 52px;
      }
      .about-eyebrow {
        font-size: 10.5px;
        font-weight: 800;
        letter-spacing: .22em;
        color: #4f46e5;
        margin-bottom: 12px;
      }
      :is(.dark) .about-eyebrow { color: #818cf8; }
      .about-headline {
        font-size: clamp(1.9rem, 4.5vw, 3.2rem);
        font-weight: 800;
        letter-spacing: -.035em;
        line-height: 1.1;
        color: #0f172a;
        margin-bottom: 12px;
      }
      :is(.dark) .about-headline { color: #f1f5f9; }
      .about-headline em {
        font-style: normal;
        color: #4f46e5;
      }
      :is(.dark) .about-headline em { color: #818cf8; }
      .about-tagline {
        font-size: 13.5px;
        color: #64748b;
        font-style: italic;
      }

      /* ── Grid ── */
      .about-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 22px;
      }
      @media (max-width: 680px) {
        .about-grid {
          grid-template-columns: 1fr;
          max-width: 340px;
          margin: 0 auto;
        }
      }
      @media (min-width: 681px) and (max-width: 900px) {
        .about-grid { grid-template-columns: repeat(2, 1fr); }
      }

      /* ── Card ── */
      .about-card {
        background: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid #e8edf4;
        box-shadow: 0 2px 12px rgba(0,0,0,.06);
        transition: transform .28s ease, box-shadow .28s ease;
        animation: cardUp .48s ease both;
      }
      :is(.dark) .about-card {
        background: #1e293b;
        border-color: #334155;
        box-shadow: 0 2px 18px rgba(0,0,0,.28);
      }
      .about-card:hover {
        transform: translateY(-7px);
        box-shadow: 0 18px 40px rgba(79,70,229,.13), 0 4px 14px rgba(0,0,0,.08);
      }
      @keyframes cardUp {
        from { opacity:0; transform:translateY(22px); }
        to   { opacity:1; transform:translateY(0); }
      }

      /* ── Photo ── */
      .about-photo-wrap {
        position: relative;
        width: 100%;
        padding-top: 70%;   /* portrait aspect ratio */
        background: #f0f4f8;
        overflow: hidden;
      }
      :is(.dark) .about-photo-wrap { background: #0f172a; }
      .about-photo {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
        transition: transform .5s ease;
      }
      .about-card:hover .about-photo { transform: scale(1.05); }

      /* Number badge */
      .about-num-badge {
        position: absolute;
        bottom: 12px;
        left: 14px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: .06em;
        color: #fff;
        background: rgba(79,70,229,.82);
        backdrop-filter: blur(6px);
        padding: 3px 10px;
        border-radius: 99px;
      }

      /* ── Card body ── */
      .about-card-body {
        padding: 16px 18px 22px;
      }
      .about-role {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .17em;
        text-transform: uppercase;
        color: #4f46e5;
        margin-bottom: 4px;
      }
      :is(.dark) .about-role { color: #818cf8; }
      .about-name {
        font-size: 17px;
        font-weight: 700;
        letter-spacing: -.02em;
        color: #0f172a;
        margin-bottom: 8px;
        line-height: 1.2;
      }
      :is(.dark) .about-name { color: #f1f5f9; }
      .about-desc {
        font-size: 12px;
        line-height: 1.7;
        color: #64748b;
      }
      :is(.dark) .about-desc { color: #94a3b8; }

      /* ── Footer ── */
      .about-footer {
        margin-top: 44px;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 18px 22px;
        border-radius: 14px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
      }
      :is(.dark) .about-footer {
        background: #1e293b;
        border-color: #334155;
      }
      .about-footer-name {
        font-size: 13.5px;
        font-weight: 600;
        color: #0f172a;
      }
      :is(.dark) .about-footer-name { color: #f1f5f9; }
      .about-footer-sub {
        font-size: 11px;
        color: #64748b;
        margin-top: 2px;
      }
    `}</style>
  </div>
);

export default About;