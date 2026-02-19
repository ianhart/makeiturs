import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-dark border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.svg"
                alt="Make It Urs"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-white">
                Make It Urs
              </span>
            </div>
            <p className="text-white/60 leading-relaxed max-w-sm">
              The Restaurant Growth OS for multi-location brands. We systemize
              your brand, menus, and campaigns so you can focus on operations.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Restaurant Growth OS
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#pillars" className="text-white/60 hover:text-gold transition-colors">
                  Brand System OS
                </a>
              </li>
              <li>
                <a href="#pillars" className="text-white/60 hover:text-gold transition-colors">
                  Menu & Campaign Engine
                </a>
              </li>
              <li>
                <a href="#pillars" className="text-white/60 hover:text-gold transition-colors">
                  Brand Command Center
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-white/60 hover:text-gold transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#portfolio" className="text-white/60 hover:text-gold transition-colors">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-white/60 hover:text-gold transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#faq" className="text-white/60 hover:text-gold transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#cta" className="text-white/60 hover:text-gold transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} Make It Urs. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-white/40 hover:text-gold transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-white/40 hover:text-gold transition-colors text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
