import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

// Using testimonial placeholders as the product is launching soon
const testimonials = [
  {
    name: "Placeholder",
    role: "Early Access Tester",
    content: "We're excited to share user testimonials here once FloHub launches. Register your interest to be among our first users and provide feedback.",
    initials: "FH",
    bgColor: "bg-primary/20",
    textColor: "text-primary",
    rating: 5
  },
  {
    name: "Coming Soon",
    role: "Beta Participant",
    content: "User feedback will appear in this section after our initial launch. We're committed to building a platform that addresses real workflow needs.",
    initials: "CS",
    bgColor: "bg-accent/20",
    textColor: "text-accent",
    rating: 5
  },
  {
    name: "Your Feedback",
    role: "Future User",
    content: "Your experience and testimonial could be featured here. We value input from all users to continuously improve the FloHub experience.",
    initials: "YF",
    bgColor: "bg-primary/20",
    textColor: "text-primary",
    rating: 5
  }
];

const HomeTestimonials: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section id="testimonials" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-base font-semibold text-primary uppercase tracking-wide">Testimonials</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Join our early users</p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            We're building FloHub with user feedback at the core. Register your interest to help shape the platform.
          </p>
        </motion.div>

        <motion.div 
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              variants={itemVariants}
            >
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-full ${testimonial.bgColor} flex items-center justify-center ${testimonial.textColor} font-bold`}>
                    {testimonial.initials}
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <div className="text-gray-700">
                <p>"{testimonial.content}"</p>
              </div>
              <div className="mt-4 flex">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HomeTestimonials;
