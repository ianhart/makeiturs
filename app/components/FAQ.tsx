"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What\u2019s included in Restaurant Growth OS?",
    answer:
      "Restaurant Growth OS includes three pillars: Brand System OS (brand guidelines, asset library, locked templates), Menu & Campaign Engine (menu templates, seasonal campaign kits, social/email/in-store assets), and Brand Command Center (review tracking, social cadence dashboard, monthly strategy huddles). Everything is designed to scale with your locations.",
  },
  {
    question:
      "How is this different from hiring a designer or a traditional agency?",
    answer:
      "Designers give you deliverables. Agencies give you projects. We give you a system. Restaurant Growth OS is built to be reused across every location, every season, and every campaign\u2014so each new launch is faster and cheaper than the last. Plus, you get a strategic partner who understands restaurant operations, not just aesthetics.",
  },
  {
    question: "Can this work if we already use tools like owner.com?",
    answer:
      "Yes. Restaurant Growth OS sits above your tech stack. owner.com, Toast, and your SEO tools handle channels and transactions; we handle the brand, menus, campaigns, and command center that tie everything together across locations.",
  },
  {
    question: "How many locations is this best suited for?",
    answer:
      "Restaurant Growth OS is designed for groups with 3\u201312 locations that are actively growing. If you\u2019re planning to open 2\u20133+ locations in the next 12 months, considering franchising, or just got funding to professionalize your brand\u2014this is built for you.",
  },
  {
    question: "What does the first 90 days look like?",
    answer:
      "Days 1\u201330: Deep-dive brand workshop, Brand System OS build, and menu template design. Days 31\u201360: System rollout across locations with team training and first campaign kit deployment. Days 61\u201390: Brand Command Center live, first monthly huddle, and campaign optimization based on real data.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 md:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark tracking-tight">
            Frequently Asked{" "}
            <span className="text-gold">Questions</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-xl overflow-hidden hover:border-gold/30 transition-colors"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-semibold text-dark pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gold flex-shrink-0 transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {open === i && (
                <div className="px-6 pb-6">
                  <p className="text-slate-blue leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
