import { useState } from "react";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Send,
  MessageCircle,
  Globe,
  Headphones,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        category: "general",
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Call Us",
      content: "+1 (234) 567-890",
      subContent: "Mon-Fri, 9AM-6PM EST",
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      icon: Mail,
      title: "Email Us",
      content: "support@tourhub.com",
      subContent: "We reply within 24 hours",
      color:
        "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      content: "123 Adventure Street",
      subContent: "New York, NY 10001",
      color:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    },
    {
      icon: Clock,
      title: "Working Hours",
      content: "Mon - Fri: 9AM - 6PM",
      subContent: "Sat: 10AM - 4PM",
      color:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    },
  ];

  const categories = [
    { value: "general", label: "General Inquiry" },
    { value: "booking", label: "Booking Support" },
    { value: "guide", label: "Become a Guide" },
    { value: "technical", label: "Technical Issue" },
    { value: "feedback", label: "Feedback" },
  ];

  const faqs = [
    {
      question: "How do I book a tour package?",
      answer:
        'Browse our packages, select your preferred tour, and click "Contact Guide" to discuss details and confirm your booking.',
    },
    {
      question: "Can I cancel or modify my booking?",
      answer:
        "Yes, you can cancel or modify bookings up to 48 hours before the tour date. Contact the guide directly through our chat feature.",
    },
    {
      question: "How do I become a tour guide?",
      answer:
        "Register as a guide on our platform, complete your profile, and start creating tour packages. Our team will review and approve your listings.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-primary-900 dark:from-gray-800 dark:via-gray-900 dark:to-black text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-full mb-4">
              <MessageCircle className="h-8 w-8 animate-bounce" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
              Get in{" "}
              <span className="bg-gradient-to-r from-primary-200 to-white dark:from-primary-400 dark:to-gray-100 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-12"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-gray-50 dark:fill-gray-900"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 -mt-8">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${info.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <info.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {info.title}
              </h3>
              <p className="text-gray-800 dark:text-gray-300 font-medium">
                {info.content}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {info.subContent}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <Send className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Send us a Message
                </h2>
              </div>

              {/* Success/Error Message */}
              {submitStatus && (
                <div
                  className={`mb-6 p-4 rounded-lg flex items-center space-x-3 animate-fadeIn ${
                    submitStatus === "success"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                  }`}
                >
                  {submitStatus === "success" ? (
                    <>
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                      <p>
                        Thank you! Your message has been sent successfully.
                        We'll get back to you soon.
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p>Oops! Something went wrong. Please try again.</p>
                    </>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Quick Support */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-primary-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary-600 dark:bg-primary-500 rounded-lg">
                  <Headphones className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Need Quick Support?
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                Chat with our support team for instant assistance
              </p>
              <button className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105">
                <MessageCircle className="h-5 w-5" />
                <span>Start Live Chat</span>
              </button>
            </div>

            {/* Social Media */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Follow Us
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Stay connected and get the latest updates
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["Facebook", "Twitter", "Instagram", "LinkedIn"].map(
                  (social) => (
                    <button
                      key={social}
                      className="flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-900 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 rounded-lg font-medium transition-all text-sm"
                    >
                      <span>{social}</span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* FAQ Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Quick Answers
              </h3>
              <div className="space-y-3">
                {faqs.slice(0, 2).map((faq, index) => (
                  <details
                    key={index}
                    className="group bg-gray-50 dark:bg-gray-900 rounded-lg p-3 cursor-pointer"
                  >
                    <summary className="text-sm font-medium text-gray-900 dark:text-white list-none flex items-center justify-between">
                      {faq.question}
                      <span className="text-primary-600 dark:text-primary-400 group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 pl-1">
                      {faq.answer}
                    </p>
                  </details>
                ))}
                <a
                  href="#"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  View all FAQs →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section (Optional) */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                Map Integration
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                123 Adventure Street, New York, NY 10001
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
