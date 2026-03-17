import React from 'react';

export default function Footer() {
  return (
    <footer className="relative z-20 w-full bg-white py-12 px-6 border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
        
        {/* Grille des partenaires */}
        <div className="flex flex-wrap justify-center items-center gap-12">
          
          {/* Affichage partenaires */}
          <div className="flex flex-wrap justify-center items-center gap-12">
            <img src="/logo_MESRI_boite_V.png" alt="MESRI" className="h-14 object-contain" />
            <img src="/logo-auvergne-rhone-alpes.png" alt="AURA" className="h-12 object-contain" />
            <img src="/polytech.png" alt="Polytech" className="h-12 object-contain" />
            
            {/* Séparateur visible sur desktop */}
            <div className="hidden md:block w-px h-12 bg-slate-200 mx-4"></div>

            {/* SOPRA STERIA */}
            <img 
              src="/sopra.png" 
              alt="Sopra Steria" 
              className="h-24 object-contain transition-transform hover:scale-105" 
            />
          </div>
        </div>

        {/* Copyright & Version */}
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">
            © 2026 Bee Monitor Version 1.0
          </p>
          <div className="flex justify-center gap-4">
            <span className="h-1 w-1 bg-amber-500 rounded-full"></span>
            <span className="h-1 w-1 bg-amber-500 rounded-full"></span>
            <span className="h-1 w-1 bg-amber-500 rounded-full"></span>
          </div>
        </div>
      </div>
    </footer>
  );
}