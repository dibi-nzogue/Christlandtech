import React from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Banner from '../components/Banner'
import ArticleForm from '../components/ArticleForm'
import RightPanel2 from '../components/RightPanel2'

const AddArticle: React.FC = () => {
  return (
    <div className='mx-auto w-full px-6 sm:px-10 lg:px-20 pt-10 bg-[#F4F5F8] h-full md:h-[100vh] overflow-hidden'>
        <div className='flex justify-between md:gap-10'>
            <div>
                <Sidebar />
            </div>
            <div className='w-full'>
                <Header />
                <Banner label='Ajouter un article'/>
                <div className='flex flex-col md:flex-row justify-between gap-10 pt-8'>
                    <ArticleForm />
                    <RightPanel2 />
                </div>
            </div>
        </div>
    </div>
  )
}

export default AddArticle
