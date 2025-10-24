import React from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import ProductTable from '../components/ProductTable'
import RightPanel from '../components/RightPanel'

const Dashboard: React.FC = () => {
  return (
    <div className='mx-auto w-full px-6 sm:px-10 lg:px-20 py-10 bg-[#F4F5F8] h-full md:h-[100vh] overflow-hidden'>
        <div className='flex justify-between md:gap-10'>
            <div className='md:fixed'>
                <Sidebar />
            </div>
            <div className='w-full md:pl-32'>
                <Header />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 mt-4">
                    <StatCard icon="users" label="Total Utilisateurs" value="350K" />
                    <StatCard icon="package" label="Total Produits" value="300K" />
                    <StatCard icon="file-text" label="Total Articles" value="50K" />
                    <StatCard icon="message-square" label="Total Messages" value="10K" />
                </div>
                <div className='flex flex-col md:flex-row justify-between gap-10 pt-8'>
                    <ProductTable />
                    <RightPanel />
                </div>
            </div>
        </div>
    </div>
  )
}

export default Dashboard