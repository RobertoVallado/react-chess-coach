import React from "react";
import instagramIcon from "../assets/instagram.svg";
import githubIcon from "../assets/github.svg";
import linkedinIcon from "../assets/linkedin.svg";
import { KoFiButton } from "react-kofi";
import "react-kofi/dist/styles.css";

const Footer = () => {
  return (
    <footer className="w-full border-t border-[#1f2933] bg-header-bg shrink-0">
      <div className="flex flex-col md:flex-row items-center justify-between px-5 md:px-10 py-6 md:py-[10px] gap-5 md:gap-0 text-sm text-[#e5e7eb]">
        {/* Left: Donation Button */}
        <div className="flex flex-1 justify-center md:justify-start">
          <KoFiButton
            color="#f06f52"
            id="H2H2OBC05"
            label="Donate"
            radius="12px"
          />
        </div>

        {/* Center: Title */}
        <div className="flex flex-1 flex-col items-center">
          <div className="font-semibold text-white">Bob's Chess Coach&#8194;</div>
          <div className="text-[13px] text-[#cbd5e1]">© {new Date().getFullYear()} - Roberto Vallado</div>
        </div>

        {/* Right: Social Icons */}
        <div className="flex flex-1 justify-center md:justify-end">
          <div className="flex items-center gap-[14px]">
            <a href="https://www.instagram.com/vallado_rico" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
               className="inline-flex items-center justify-center">
              <img src={instagramIcon} alt="Instagram"
                   className="w-5 h-5 object-contain [filter:invert(1)_brightness(1.2)] opacity-85 hover:opacity-100 hover:-translate-y-px transition-all" />
            </a>
            <a href="https://github.com/RobertoVallado" target="_blank" rel="noopener noreferrer" aria-label="GitHub"
               className="inline-flex items-center justify-center">
              <img src={githubIcon} alt="GitHub"
                   className="w-5 h-5 object-contain [filter:invert(1)_brightness(1.2)] opacity-85 hover:opacity-100 hover:-translate-y-px transition-all" />
            </a>
            <a href="https://www.linkedin.com/in/roberto-vallado/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
               className="inline-flex items-center justify-center">
              <img src={linkedinIcon} alt="LinkedIn"
                   className="w-5 h-5 object-contain [filter:invert(1)_brightness(1.2)] opacity-85 hover:opacity-100 hover:-translate-y-px transition-all" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
