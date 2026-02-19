
import React from "react";
import '../styles/Footer.css'
import instagramIcon from "../assets/instagram.svg";
import githubIcon from "../assets/github.svg";
import linkedinIcon from "../assets/linkedin.svg";
import { KoFiButton } from "react-kofi";
import "react-kofi/dist/styles.css";


const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        {/* Left: Donation Button */}
        <div className="footer-left">
          <div className="kofi-container">
            <KoFiButton
              color="#f06f52"
              id="H2H2OBC05"
              label="Donate"
              radius="12px"
            />
          </div>
        </div>

        {/* Center: Title */}
        <div className="footer-center">
          <div className="footer-title">Bob's Chess Coach&#8194;</div>
          <div className="footer-text">© {new Date().getFullYear()} - Roberto Vallado</div>
        </div>

        {/* Right: Social Icons */}
        <div className="footer-right">
          <div className="social-links">
            <a
              href="https://www.instagram.com/vallado_rico"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <img src={instagramIcon} alt="Instagram" />
            </a>
            <a
              href="https://github.com/RobertoVallado"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <img src={githubIcon} alt="GitHub" />
            </a>
            <a
              href="https://www.linkedin.com/in/roberto-vallado/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <img src={linkedinIcon} alt="LinkedIn" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
