import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#fbe7d6] text-[#774846] mt-10">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand / About */}
          <div>
            <h2 className="text-2xl font-bold">FriendsApp</h2>
            <p className="mt-3 text-sm text-[#774846]/80">
              Create rooms, share memories, and stay connected with your best
              friends. Built with ❤️ using React & TailwindCSS.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-[#b56b60] transition">
                  Home
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-[#b56b60] transition">
                  Login
                </a>
              </li>
              <li>
                <a href="/signup" className="hover:text-[#b56b60] transition">
                  Sign Up
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-[#b56b60] transition">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
            <div className="flex gap-4 text-xl">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#b56b60] transition"
              >
                <FaGithub />
              </a>
              <a
                href="https://linkedin.com/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#b56b60] transition"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#b56b60] transition"
              >
                <FaTwitter />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#774846]/20 mt-10 pt-6 text-center text-sm text-[#774846]/70">
          © {new Date().getFullYear()} FriendsApp. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
