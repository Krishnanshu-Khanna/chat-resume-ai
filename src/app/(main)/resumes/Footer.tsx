import React from "react";
import { CopyrightIcon, Github, Linkedin, Twitter } from "lucide-react";


const Footer = () => {
  return (
    <footer className="dark:border-gray-70  bottom-0 m-auto w-[95%] border-t border-gray-300 py-4 text-gray-700 dark:text-white">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 md:flex-row">
        {/* Copyright Section */}
        <div className="flex items-center text-sm gap-2 text-gray-700 dark:text-gray-400">
          <CopyrightIcon />
          <span className="">
            {new Date().getFullYear()} CVHelper. All Rights Reserved.
          </span>
        </div>

        {/* Social Media Links */}
        <div className="flex space-x-5">
          <a
            href="https://github.com/Krishnanshu-Khanna"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-indigo-500"
            aria-label="GitHub"
          >
            <Github className="h-6 w-6" />
          </a>
          <a
            href="https://www.linkedin.com/in/krishnanshu-khanna/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-indigo-500"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-6 w-6" />
          </a>
          <a
            href="https://x.com/lunaticfellla"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-indigo-500"
            aria-label="Twitter"
          >
            <Twitter className="h-6 w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
