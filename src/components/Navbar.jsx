import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
        <nav className=" fixed top-0 left-0 w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="flex-shrink-0 text-2xl font-bold text-teal-600 dark:text-teal-400">
                    Friends
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-6 ">
                    <a href="#" className=" text-xl text-gray-700 dark:text-gray-300 hover:text-teal-500">
                    About
                    </a>
                    <a href="#" className="text-xl text-gray-700 dark:text-gray-300 hover:text-teal-500">
                    Services
                    </a>
                    <a href="#" className="text-xl text-gray-700 dark:text-gray-300 hover:text-teal-500">
                    Contact
                    </a>
                </div>

                {/* Mobile Button */}
                <div className="md:hidden">
                    <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-gray-700 dark:text-gray-300 hover:text-teal-500 focus:outline-none"
                    >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 px-4 pt-2 pb-4 space-y-2 shadow-md">
                <a href="#" className="block text-gray-700 dark:text-gray-300 hover:text-teal-500">
                    About
                </a>
                <a href="#" className="block text-gray-700 dark:text-gray-300 hover:text-teal-500">
                    Services
                </a>
                <a href="#" className="block text-gray-700 dark:text-gray-300 hover:text-teal-500">
                    Contact
                </a>
                </div>
            )}
        </nav> 
    </>
  );
};

export default Navbar;
