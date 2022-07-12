import React from 'react'

function Banner() {
  return (
    <div className='flex justify-between items-center bg-yellow-400 border-y border-black py-10 lg:py-0'>
        <div className='px-10 space-y-5'>
          <h1 className="text-5xl max-w-xl font-serif"><span className="underline decoration-black decoration-4">Medium</span> is a place to write read and connect</h1>
          <h2>It's easy and fee to post your thinking on any topic and connect with millions of users</h2>
        </div>
        <img className='hidden px-10 md:inline-flex h-32 lg:h-full' src="/medium.png" alt="medium" />
    </div>
  )
}

export default Banner