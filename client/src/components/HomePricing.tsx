import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckIcon } from 'lucide-react';

const pricingPlans = [
  {
    name: "Starter",
    price: "$12",
    description: "Perfect for small teams just getting started.",
    features: [
      "Up to 5 team members",
      "10 projects",
      "Basic reporting",
      "Community support"
    ],
    buttonText: "Start your trial",
    buttonVariant: "default",
    highlight: false,
    accentColor: "bg-primary/10 text-primary",
    buttonColor: "bg-primary hover:bg-primary/90"
  },
  {
    name: "Pro",
    price: "$32",
    description: "The ideal package for growing teams.",
    features: [
      "Up to 20 team members",
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "Custom integrations"
    ],
    buttonText: "Start your trial",
    buttonVariant: "default",
    highlight: true,
    accentColor: "bg-primary/10 text-primary",
    buttonColor: "bg-primary hover:bg-primary/90",
    borderColor: "border-2 border-primary" 
  },
  {
    name: "Enterprise",
    price: "$89",
    description: "Advanced features for larger organizations.",
    features: [
      "Unlimited team members",
      "Unlimited projects",
      "Advanced security",
      "Dedicated support",
      "Custom branding"
    ],
    buttonText: "Contact us",
    buttonVariant: "accent",
    highlight: false,
    accentColor: "bg-accent/10 text-accent",
    buttonColor: "bg-accent hover:bg-accent/90"
  }
];

const HomePricing: React.FC = () => {
  const dashboardUrl = "https://flow-hubdev.vercel.app/dashboard";
  
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
    <section id="pricing" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-base font-semibold text-primary uppercase tracking-wide">Pricing</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Plans for teams of all sizes</p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Choose the perfect plan for your team's needs. All plans include core features.
          </p>
        </motion.div>

        <motion.div 
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {pricingPlans.map((plan, index) => (
            <motion.div 
              key={index}
              className={`flex flex-col rounded-lg shadow-sm overflow-hidden bg-white ${plan.highlight ? plan.borderColor : "border border-gray-200"} transition-colors duration-200 hover:border-primary`}
              variants={itemVariants}
            >
              <div className="px-6 py-8 bg-white sm:p-10 sm:pb-6">
                <div>
                  <h3 className={`inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase ${plan.accentColor}`}>
                    {plan.name}
                  </h3>
                </div>
                <div className="mt-4 flex items-baseline text-6xl font-extrabold">
                  {plan.price}
                  <span className="ml-1 text-2xl font-medium text-gray-500">/mo</span>
                </div>
                <p className="mt-5 text-lg text-gray-500">
                  {plan.description}
                </p>
              </div>
              <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-gray-50 sm:p-10">
                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckIcon className="h-6 w-6 text-green-500" />
                      </div>
                      <p className="ml-3 text-base text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Button asChild className={`w-full ${plan.buttonColor}`}>
                    <a href={dashboardUrl}>
                      {plan.buttonText}
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HomePricing;
