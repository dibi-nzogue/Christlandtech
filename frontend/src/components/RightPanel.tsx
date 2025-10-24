import hp from "../assets/images/hp.jpg";
import { useNavigate } from "react-router-dom";

const RightPanel = () => {

  const navigate = useNavigate();

  return (
    <div className="space-y-4 w-full md:w-1/4  h-[80vh] md:h-[50vh] lg:h-[65vh]">
      <button 
        onClick={() => navigate('/Dashboard/Ajouter_produit')}
        className="w-full bg-[#00A9DC] hover:bg-sky-600 text-white py-2 rounded-xl shadow"
      >
        Ajouter un produit
      </button>
      <button 
        onClick={() => navigate('/Dashboard/Ajouter_article')}
        className="w-full bg-[#00A9DC] hover:bg-sky-600 text-white py-2 rounded-xl shadow"
      >
        Ajouter un article
      </button>

      <div className="bg-white p-4 rounded-xl shadow-sm mt-4">
        <h3 className="font-semibold mb-3">Les Plus Demandés</h3>
        {[1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-3 mb-3">
            <img src={hp} alt="HP" className="w-[100%] h-24 lg:h-44 rounded-lg" />
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">HP Elitebook</p>
              <p className="text-xs text-gray-500">90.000Cfa</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RightPanel;
