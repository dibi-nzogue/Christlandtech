import React from 'react'
import hero4 from '../assets/images/hero4.png';

const HeroAbout: React.FC = () => {
  return (
    <div className='mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10 pt-8 md:pt-28 lg:pt-32 pb-20'>
        <div className=''>
            <h1 className='font-extrabold text-[13px] sm:text-sm md:text-xl lg:text-2xl xl:text-4xl'>
                A Propos de CHRISTLAND <span className="text-[#00A8E8]">TECH</span>
            </h1>
            <p className='pt-4 md:pt-10 font-semibold text-sm md:text-lg lg:text-xl'>
                C'est simple: <br /> Nous voulons ce que vous voulez,
            </p>
        </div>
        <div className='flex justify-between pt-10 md:pt-16'>
            <div className='w-2/3'>
                <img src={hero4} alt="" />
            </div>
            <div className='bg-[#6cbad9]/30 rounded-tr-[50px] rounded-br-[50px]'>
                <h2>
                    Nous Sommes Un Fournisseur Indépendant De Technologies Et De Services. 
                </h2>
                <p>
                    Nous sommes une  entreprise responsable qui croit en la possibilité de gagner ensemble pour nos collaborateurs et  notre planète, continent.  Nous accompagnons nos clients dans les phases d'approvisionnement, de transformation et de  gestion de leur infrastructure technologique pour leur assurer une transformation numérique  permettant à leurs employés et à leur entreprise de se développer.
                </p>
            </div>
        </div>
    </div>
  )
}

export default HeroAbout