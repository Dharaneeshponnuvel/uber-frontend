import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Clock, Star, MapPin, CreditCard, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Easy Booking',
      description: 'Book rides in seconds with our intuitive interface'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Safe & Secure',
      description: 'All drivers are verified and trips are tracked'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Quick Arrival',
      description: 'Average pickup time of just 5 minutes'
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: 'Cashless Payment',
      description: 'Secure payments with Stripe integration'
    }
  ];

  const stats = [
    { icon: <Users className="h-8 w-8" />, value: '1M+', label: 'Happy Riders' },
    { icon: <Car className="h-8 w-8" />, value: '50K+', label: 'Verified Drivers' },
    { icon: <TrendingUp className="h-8 w-8" />, value: '100+', label: 'Cities Covered' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Ride,
              <span className="text-accent-400"> Anytime</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Safe, reliable, and affordable rides at your fingertips. 
              Join millions who trust RideShare for their daily commute.
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user.userType === 'rider' ? (
                  <>
                    <Link
                      to="/book-ride"
                      className="bg-accent-500 hover:bg-accent-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 inline-flex items-center justify-center transform hover:scale-105"
                    >
                      <Car className="mr-2 h-5 w-5" />
                      Book a Ride Now
                    </Link>
                    <Link
                      to="/ride-history"
                      className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
                    >
                      View History
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/dashboard"
                    className="bg-accent-500 hover:bg-accent-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 inline-flex items-center justify-center transform hover:scale-105"
                  >
                    <Car className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="bg-accent-500 hover:bg-accent-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 inline-flex items-center justify-center transform hover:scale-105"
                >
                  <Car className="mr-2 h-5 w-5" />
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose RideShare?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best ride experience with features designed around your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card text-center hover:scale-105 transform transition-all duration-300"
              >
                <div className="text-primary-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-primary-600 mb-4 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-lg text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Riding?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join our community of riders and drivers today.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register?type=rider"
                className="bg-accent-500 hover:bg-accent-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Become a Rider
              </Link>
              <Link
                to="/register?type=driver"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
              >
                Become a Driver
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;