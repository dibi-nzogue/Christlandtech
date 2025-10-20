import React from 'react'
import hp from "../assets/images/hp.jpg";

const RightPanel1: React.FC = () => {
  return (
    <div className='space-y-4 w-full md:w-1/4'>
        <div className="bg-white p-4 rounded-xl shadow-sm mt-4">
            <h3 className="font-semibold mb-3">Les Plus Récents</h3>
            {[1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-3 mb-3">
                <img src={hp} alt="HP" className="w-[100%] h-44 rounded-lg" />
                <div className="flex items-center justify-between">
                <p className="text-sm font-medium">HP Elitebook</p>
                <p className="text-xs text-gray-500">90.000Cfa</p>
                </div>
            </div>
            ))}
        </div>
    </div>
  )
}

export default RightPanel1