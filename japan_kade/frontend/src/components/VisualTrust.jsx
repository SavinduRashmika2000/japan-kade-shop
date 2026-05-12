import React from 'react';

const VisualTrust = () => {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative w-full h-[500px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl flex items-center justify-center">
        <div className="absolute inset-0 bg-slate-900/40 z-10"></div>
        <img 
          src="/garage-trust.png" 
          alt="Premium Garage Interior" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-20 text-center px-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight">
            Premium Parts for<br />Peak Performance
          </h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default VisualTrust;
