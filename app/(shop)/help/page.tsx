"use client";

import { useState } from "react";
import { Search, Truck, RotateCcw, Ruler, CreditCard, Plus, Minus } from "lucide-react";

export default function HelpCenter() {
  const [activeTopic, setActiveTopic] = useState("overview");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const helpTopics = [
    { id: "overview", label: "Overview" },
    { id: "shipping", label: "Shipping & Delivery" },
    { id: "returns", label: "Returns & Exchanges" },
    { id: "size", label: "Size & Fit" },
    { id: "care", label: "Product Care" },
    { id: "contact", label: "Contact Us" },
  ];

  const categories = [
    {
      id: "cat-shipping",
      title: "Shipping & Delivery",
      description: "Information on delivery times, costs, and international shipping.",
      icon: Truck,
    },
    {
      id: "cat-returns",
      title: "Returns",
      description: "Our return policy, how to initiate a return, and refund processing times.",
      icon: RotateCcw,
    },
    {
      id: "cat-size",
      title: "Size Guide",
      description: "Detailed measurements and fit advice for all our garments.",
      icon: Ruler,
    },
    {
      id: "cat-payments",
      title: "Payment Options",
      description: "Accepted payment methods, secure checkout, and billing inquiries.",
      icon: CreditCard,
    },
  ];

  const faqs = [
    {
      question: "How long does standard shipping take?",
      answer: "Standard shipping typically takes 3-5 business days within the contiguous United States. International orders usually arrive within 10-14 business days, depending on customs clearance. You will receive a tracking number via email once your order has shipped.",
    },
    {
      question: "Can I modify or cancel my order after placing it?",
      answer: "We begin processing orders immediately to ensure prompt delivery. Unfortunately, we cannot modify or cancel orders once they have been placed. However, you can return unwanted items following our standard return policy once you receive them.",
    },
    {
      question: "What is your return policy for sale items?",
      answer: "Items purchased on final sale cannot be returned or exchanged. Regular sale items can be returned within 14 days of delivery for store credit only. Please ensure all items are unworn, unwashed, and have original tags attached.",
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
            How can we assist you?
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
              placeholder="Search for answers..."
            />
          </div>
        </header>

        {/* Sidebar & Content Split */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-item-gap items-start">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-1/4 sticky top-28 hidden lg:block select-none">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#55423d]/60 mb-6">
              Help Topics
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
                    No results found matching your search.
                  </p>
                )}
              </div>
            </section>

            {/* FAQ Accordion */}
            <section className="border-t border-hairline/30 pt-12">
              <h2 className="font-serif text-2xl md:text-3xl text-ink font-light tracking-tight mb-8 border-b border-hairline pb-4">
                Frequently Asked Questions
              </h2>
              
              <div className="flex flex-col">
                {faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div key={index} className="flex flex-col border-b border-hairline/50">
                      <button
                        onClick={() => toggleFaq(index)}
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
                Still need help?
              </h2>
              <p className="text-sm md:text-base text-on-dark/75 leading-relaxed font-light mb-8 max-w-md">
                Our customer concierge team is available Monday through Friday, 9am to 6pm EST to assist with your editorial styling and order inquiries.
              </p>
              <a
                href="mailto:concierge@velawear.com"
                className="inline-block bg-primary text-on-primary font-serif uppercase text-xs md:text-sm tracking-[0.15em] px-8 py-4 rounded-sm hover:bg-[#8f4329] active:scale-95 transition-all duration-300"
              >
                Contact Concierge
              </a>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
