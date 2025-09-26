import React from 'react';
import { useNavigate } from 'react-router-dom';

// Simple reusable components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

// CareMap data
const companyData = {
  name: "CareMap",
  tagline: "Connecting You to Quality Healthcare, Everywhere",
  
  mission: "CareMap bridges the gap between patients and quality healthcare by providing a comprehensive, location-based platform that connects individuals with reputable clinics, diagnostic centers, and medical laboratories in their area. Our mission is to eliminate the uncertainty and stress of finding trusted healthcare providers, regardless of where you are.",

  vision: "To create a world where distance and unfamiliarity never prevent someone from accessing quality healthcare. We envision a future where every individual can confidently find and connect with verified, reputable medical facilities within minutes, anywhere they may be.",

  description: "CareMap is a revolutionary healthcare discovery platform designed to solve one of the most fundamental challenges in modern healthcare: finding reliable medical services when you need them most. Whether you're traveling, relocating, or simply seeking better healthcare options in your area, CareMap provides instant access to a carefully curated network of verified clinics, diagnostic laboratories, and specialized medical centers.",

  problemSolution: {
    problem: "Millions of people struggle daily to find reputable healthcare providers, especially when away from their familiar locations. This challenge leads to delayed medical care, anxiety, and often settling for substandard services.",
    solution: "CareMap eliminates this barrier by providing real-time, location-based access to a comprehensive database of verified healthcare facilities, complete with ratings, specializations, availability, and patient reviews."
  },

  keyFeatures: [
    {
      title: "Smart Location Detection",
      description: "Advanced GPS technology instantly identifies nearby healthcare facilities based on your exact location",
      icon: "📍"
    },
    {
      title: "Verified Provider Network",
      description: "Rigorous verification process ensures all listed clinics and labs meet our quality standards",
      icon: "✅"
    },
    {
      title: "Comprehensive Profiles",
      description: "Detailed information on specializations, equipment, certifications, and patient reviews",
      icon: "📋"
    },
    {
      title: "Multi-Specialty Search",
      description: "Find everything from general clinics to specialized diagnostic centers and laboratories",
      icon: "🏥"
    },
    {
      title: "Patient Reviews & Ratings",
      description: "Community-driven feedback system ensuring transparency and quality assurance",
      icon: "⭐"
    },
    {
      title: "Discretion and Privacy",
      description: "No one needs to know you're looking for a hospital. Our app ensures that your identity is secure while you take care of your health",
      icon: "👁️‍🗨️"
    }
  ],

  targetUsers: [
    "People who want to discreetly get information on qualified health centres near them",
    "Travelers seeking medical care in unfamiliar locations",
    "Patients looking for specialized diagnostic services",
    "People seeking second opinions from different medical facilities",
    "Anyone wanting to discover better healthcare options in their area",
    "Emergency situations requiring immediate access to nearby medical care"
  ],

  valueProposition: "CareMap transforms the way people access healthcare by removing geographical barriers and information gaps. Our platform saves time, reduces anxiety, and ensures that quality medical care is always within reach, making healthcare discovery as simple as finding the nearest coffee shop.",

  founded: "2025",
  
  stats: [
    { label: "Verified Clinics", value: "200,000+" },
    { label: "Cities Covered", value: "5000+" },
    { label: "Real User Reviews", value: "500,000+" },
    { label: "Privacy Compliant", value: "100%" }
  ]
};

function AboutCareMap() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      
      {/* Header Section */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-6xl mb-6">🗺️</div>
          <h1 className="text-5xl font-bold mb-6">
            About {companyData.name}
          </h1>
          <p className="text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            {companyData.tagline}
          </p>
          <p className="text-lg max-w-4xl mx-auto leading-relaxed opacity-80">
            {companyData.description}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {companyData.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            The Problem We Solve
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-l-4 border-red-500">
              <CardContent>
                <h3 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
                  <span className="text-3xl mr-3">🚫</span>
                  The Challenge
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {companyData.problemSolution.problem}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-green-500">
              <CardContent>
                <h3 className="text-2xl font-bold text-green-600 mb-4 flex items-center">
                  <span className="text-3xl mr-3">💡</span>
                  Our Solution
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {companyData.problemSolution.solution}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent>
                <h2 className="text-3xl font-bold text-blue-900 mb-4 flex items-center">
                  <span className="text-4xl mr-3">🎯</span>
                  Our Mission
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {companyData.mission}
                </p>
                <div className="mt-6 flex items-center text-blue-600">
                  <span className="text-2xl mr-3">📅</span>
                  <span className="font-semibold">Founded in {companyData.founded}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent>
                <h2 className="text-3xl font-bold text-green-900 mb-4 flex items-center">
                  <span className="text-4xl mr-3">🌟</span>
                  Our Vision
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {companyData.vision}
                </p>
                <div className="mt-6 flex items-center text-green-600">
                  <span className="text-2xl mr-3">🚀</span>
                  <span className="font-semibold">Revolutionizing Healthcare Access</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Key Features
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Discover what makes CareMap a trusted healthcare discovery platform
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companyData.keyFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:scale-105 transition-transform duration-300">
                <CardContent>
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Target Users Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Who We Serve
          </h2>
          <p className="text-xl text-center mb-12 opacity-90 max-w-3xl mx-auto">
            CareMap is designed for everyone who values quality healthcare access
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companyData.targetUsers.map((user, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-opacity-20 transition-all duration-300">
                <div className="text-3xl mb-3">👥</div>
                <p className="text-lg">{user}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Why Choose CareMap?
          </h2>
          <Card className="bg-gradient-to-r from-blue-50 to-green-50">
            <CardContent className="p-12">
              <div className="text-6xl mb-6">💎</div>
              <p className="text-xl text-gray-700 leading-relaxed">
                {companyData.valueProposition}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="text-6xl mb-6">🏥</div>
          <h2 className="text-4xl font-bold mb-6">
            Ready to Discover Quality Healthcare?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join those who trust CareMap to find reputable healthcare providers anywhere, anytime. Click the button below to get started
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            
            <button onClick={() => navigate('/login')} className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors duration-300">
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-800 text-white text-center">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-lg mb-2">© 2024 CareMap. All rights reserved.</p>
          <p className="text-gray-400">Connecting you to quality healthcare, everywhere.</p>
        </div>
      </footer>
    </div>
  );
}

export default AboutCareMap;