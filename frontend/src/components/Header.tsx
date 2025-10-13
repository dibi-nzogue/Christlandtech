import { Search, ShoppingCart, Bell } from "lucide-react";

const Header = () => {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 lg:gap-0 pt-8 lg:pt-0">
      <div>
        <h2 className="text-sm text-gray-600">Hi, Franck !</h2>
        <h1 className="text-xl font-bold">Bon retour !</h1>
      </div>

      <div className="flex justify-between items-center gap-5 lg:gap-10 xl:gap-20">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="pl-5 pr-4 py-3 rounded-full bg-white shadow-sm focus:outline-none w-full md:w-[500px]"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" />
        </div>
        <div className="flex items-center gap-5">
        <ShoppingCart className="text-gray-700 cursor-pointer" />
        <Bell className="text-gray-700 cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

export default Header;
