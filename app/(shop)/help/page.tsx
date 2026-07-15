"use client";

import { useState } from "react";
import { Search, Truck, RotateCcw, Ruler, CreditCard, Plus, Minus } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";

export default function HelpCenter() {
  const { t } = useI18n();
  const [activeTopic, setActiveTopic] = useState("overview");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const helpTopics = [
    { id: "overview", label: t("help.topic.overview") },
    { id: "shipping", label: t("help.topic.shipping") },
    { id: "returns", label: t("help.topic.returns") },
    { id: "size", label: t("help.topic.size") },
    { id: "care", label: t("help.topic.care") },
    { id: "contact", label: t("help.topic.contact") },
  ];

  const categories = [
    {
      id: "cat-shipping",
      title: t("help.category.shipping.title"),
      description: t("help.category.shipping.description"),
      icon: Truck,
    },
    {
      id: "cat-returns",
      title: t("help.category.returns.title"),
      description: t("help.category.returns.description"),
      icon: RotateCcw,
    },
    {
      id: "cat-size",
      title: t("help.category.size.title"),
      description: t("help.category.size.description"),
      icon: Ruler,
    },
    {
      id: "cat-payments",
      title: t("help.category.payment.title"),
      description: t("help.category.payment.description"),
      icon: CreditCard,
    },
  ];

  const faqs = [
    {
      question: t("help.faq.shipping.question"),
      answer: t("help.faq.shipping.answer"),
    },
    {
      question: t("help.faq.change.question"),
      answer: t("help.faq.change.answer"),
    },
    {
      question: t("help.faq.sale.question"),
      answer: t("help.faq.sale.answer"),
    },
  ];

  const filteredCategories = categories.filter(
    (cat) =>
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-canvas text-ink min-h-screen flex flex-col">
      <main className="flex-grow w-full max-w-[1800px] mx-auto px-6 md:px-16 pt-[104px] pb-12 md:pt-[120px] md:pb-16">
        
        {/* Header & Search */}
        <header className="text-center mb-16 md:mb-20 max-w-2xl mx-auto flex flex-col items-center">
          <h1 className="font-serif text-3xl md:text-display-xl text-ink font-light leading-tight tracking-[-0.02em] mb-8">
            {t("help.title")}
          </h1>
          <div className="relative w-full shadow-sm rounded-sm overflow-hidden border border-hairline">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
              <Search className="size-5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest py-4 pl-12 pr-4 font-sans text-sm text-ink placeholder-[#55423d]/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all p-0 border-none"
              placeholder={t("help.search")}
              aria-label={t("help.search")}
            />
          </div>
        </header>

        {/* Sidebar & Content Split */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-item-gap items-start">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-1/4 sticky top-28 hidden lg:block select-none">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#55423d]/60 mb-6">
              {t("help.topics")}
            </h3>
            <nav className="flex flex-col gap-4">
              {helpTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopic(topic.id)}
                  className={`text-left text-sm font-medium tracking-[0.05em] pl-4 py-1 border-l-2 transition-all ${
                    topic.id === activeTopic
                      ? "text-primary border-primary"
                      : "text-[#55423d]/70 hover:text-primary border-transparent"
                  }`}
                >
                  {topic.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Help Content */}
          <div className="w-full lg:w-3/4 flex flex-col gap-16 md:gap-section">
            
            {/* Category Grid */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-item-gap">
                {filteredCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <a
                      key={category.id}
                      href="#"
                      className="group block bg-surface-card border border-hairline/35 p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 rounded-sm"
                    >
                      <IconComponent className="size-8 text-primary mb-4 transition-transform group-hover:scale-105" />
                      <h3 className="font-serif text-xl md:text-2xl text-ink font-medium tracking-tight mb-2">
                        {category.title}
                      </h3>
                      <p className="text-sm text-on-surface-variant/85 font-light leading-relaxed">
                        {category.description}
                      </p>
                    </a>
                  );
                })}
                {filteredCategories.length === 0 && (
                  <p className="col-span-2 text-center text-[#55423d]/60 py-8 text-sm italic">
                    {t("help.noResults")}
                  </p>
                )}
              </div>
            </section>

            {/* FAQ Accordion */}
            <section className="border-t border-hairline/30 pt-12">
              <h2 className="font-serif text-2xl md:text-3xl text-ink font-light tracking-tight mb-8 border-b border-hairline pb-4">
                {t("help.faq.title")}
              </h2>
              
              <div className="flex flex-col">
                {faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div key={index} className="flex flex-col border-b border-hairline/50">
                      <button
                        onClick={() => toggleFaq(index)}
                        aria-expanded={isOpen}
                        aria-label={t(isOpen ? "help.faq.collapse" : "help.faq.expand", { question: faq.question })}
                        className="w-full flex justify-between items-center py-5 text-left focus:outline-none hover:text-primary transition-colors group"
                      >
                        <span className="font-sans text-sm md:text-base font-medium text-ink group-hover:text-primary transition-colors">
                          {faq.question}
                        </span>
                        <span className="text-[#55423d]/60 group-hover:text-primary transition-transform duration-300">
                          {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                        </span>
                      </button>
                      
                      <div
                        className={`transition-all duration-300 overflow-hidden ${
                          isOpen ? "max-h-60 pb-6 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                        }`}
                      >
                        <p className="font-sans text-xs md:text-sm text-on-surface-variant/80 leading-relaxed pr-8 font-light">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Contact CTA */}
            <section className="bg-surface-dark text-on-dark p-8 md:p-12 text-center flex flex-col items-center justify-center rounded-sm shadow-xl select-none">
              <h2 className="font-serif text-2xl md:text-3xl text-white font-light mb-4 tracking-tight">
                {t("help.contact.title")}
              </h2>
              <p className="text-sm md:text-base text-on-dark/75 leading-relaxed font-light mb-8 max-w-md">
                {t("help.contact.description")}
              </p>
              <a
                href="mailto:concierge@velawear.com"
                className="inline-block bg-primary text-on-primary font-serif uppercase text-xs md:text-sm tracking-[0.15em] px-8 py-4 rounded-sm hover:bg-[#8f4329] active:scale-95 transition-all duration-300"
              >
                {t("help.contact.action")}
              </a>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
