
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="text-xl font-bold text-event">
              EventFlow
            </Link>
            <p className="text-gray-600 mt-2 max-w-md">
              A comprehensive event management system for planning, organizing,
              and attending events.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Navigation
              </h3>
              <div className="mt-4 space-y-2">
                <Link to="/" className="text-gray-600 hover:text-event block">
                  Home
                </Link>
                <Link to="/login" className="text-gray-600 hover:text-event block">
                  Login
                </Link>
                <Link to="/register" className="text-gray-600 hover:text-event block">
                  Register
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Resources
              </h3>
              <div className="mt-4 space-y-2">
                <a href="#" className="text-gray-600 hover:text-event block">
                  Documentation
                </a>
                <a href="#" className="text-gray-600 hover:text-event block">
                  Support
                </a>
                <a href="#" className="text-gray-600 hover:text-event block">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-gray-400 text-sm text-center">
            &copy; {new Date().getFullYear()} EventFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
