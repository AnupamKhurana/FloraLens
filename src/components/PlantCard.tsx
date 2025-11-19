import React from 'react';
import { PlantInfo } from '../types';

interface PlantCardProps {
  info: PlantInfo;
  imageUrl: string;
}

export const PlantCard: React.FC<PlantCardProps> = ({ info, imageUrl }) => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/60 overflow-hidden border border-gray-100/50">
      {/* Content Container */}
      <div className="p-8 md:p-10">
        
        {/* Top Tags */}
        <div className="flex flex-wrap gap-3 mb-8">
           <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-colors border ${info.petFriendly ? 'bg-emerald-100/60 text-emerald-800 border-emerald-200' : 'bg-rose-100/60 text-rose-800 border-rose-200'}`}>
             <span className="material-icons-round text-lg mr-2">{info.petFriendly ? 'pets' : 'warning'}</span>
             {info.petFriendly ? 'Pet Friendly' : 'Toxic to Pets'}
          </span>
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-violet-50 text-violet-700 border border-violet-100 shadow-sm">
            <span className="material-icons-round text-lg mr-2">science</span>
            {info.scientificName}
          </span>
        </div>
        
        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">{info.commonName}</h2>
        
        {/* Description */}
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-3xl border border-gray-100 mb-10 shadow-sm">
            <p className="text-gray-600 leading-relaxed text-lg font-medium">
            {info.description}
            </p>
        </div>

        {/* Care Requirements Grid */}
        <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-600 p-2 rounded-xl material-icons-round text-xl">spa</span>
            Care Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CareItem icon="water_drop" title="Watering" value={info.careInstructions.water} color="cyan" />
            <CareItem icon="light_mode" title="Sunlight" value={info.careInstructions.light} color="amber" />
            <CareItem icon="grass" title="Soil Type" value={info.careInstructions.soil} color="emerald" />
            <CareItem icon="thermostat" title="Environment" value={`${info.careInstructions.temperature}, ${info.careInstructions.humidity}`} color="violet" />
            </div>
        </div>

        {/* Fun Fact Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-[2rem] border border-amber-100/50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-yellow-400/20"></div>
          <div className="relative z-10">
             <h4 className="text-amber-800 font-bold mb-3 flex items-center text-lg">
                <span className="material-icons-round mr-3 text-amber-600 bg-amber-100 p-2 rounded-full shadow-sm ring-2 ring-white">lightbulb</span>
                Did You Know?
            </h4>
            <p className="text-amber-900/80 font-medium leading-relaxed text-lg pl-1">
                {info.funFact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CareItem: React.FC<{ icon: string, title: string, value: string, color: string }> = ({ icon, title, value, color }) => {
  
  const themes: {[key: string]: { bg: string, iconBg: string, text: string, title: string, border: string }} = {
    cyan: { bg: 'bg-cyan-50/50', iconBg: 'bg-cyan-100 text-cyan-600', text: 'text-cyan-900', title: 'text-cyan-500', border: 'border-cyan-100' },
    amber: { bg: 'bg-amber-50/50', iconBg: 'bg-amber-100 text-amber-600', text: 'text-amber-900', title: 'text-amber-500', border: 'border-amber-100' },
    emerald: { bg: 'bg-emerald-50/50', iconBg: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-900', title: 'text-emerald-500', border: 'border-emerald-100' },
    violet: { bg: 'bg-violet-50/50', iconBg: 'bg-violet-100 text-violet-600', text: 'text-violet-900', title: 'text-violet-500', border: 'border-violet-100' }
  };

  const theme = themes[color];

  return (
    <div className={`flex items-start p-5 rounded-2xl border ${theme.border} ${theme.bg} hover:bg-white hover:shadow-md transition-all duration-300 group`}>
      <div className={`p-3.5 rounded-2xl ${theme.iconBg} mr-5 shrink-0 shadow-sm group-hover:scale-110 transition-transform ring-1 ring-white/50`}>
        <span className="material-icons-round text-2xl">{icon}</span>
      </div>
      <div>
        <h4 className={`text-xs uppercase tracking-wider ${theme.title} font-bold mb-1.5`}>{title}</h4>
        <p className={`text-sm ${theme.text} font-bold leading-snug`}>{value}</p>
      </div>
    </div>
  );
};