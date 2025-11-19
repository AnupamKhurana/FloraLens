import React, { useState } from 'react';
import { AppView, PlantInfo } from './types';
import { identifyPlant } from './services/geminiService';
import { PlantCard } from './components/PlantCard';
import { ChatBot } from './components/ChatBot';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.ANALYZE);
  const [plantData, setPlantData] = useState<PlantInfo | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setPlantData(null);
    setSelectedImage(null);
    setIsAnalyzing(true);

    let processFile = file;

    // Handle HEIC conversion
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heif') {
      try {
        // @ts-ignore
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8
        });
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        processFile = new File([blob], file.name.replace(/\.heic$/i, ".jpg"), { type: "image/jpeg" });
      } catch (err) {
        console.error("HEIC conversion error:", err);
        setError("Could not process HEIC image. Please try a JPEG or PNG.");
        setIsAnalyzing(false);
        return;
      }
    }

    const objectUrl = URL.createObjectURL(processFile);
    setSelectedImage(objectUrl);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(processFile);
      });

      const base64Content = base64Data.split(',')[1];
      const mimeType = processFile.type;

      const data = await identifyPlant(base64Content, mimeType);
      setPlantData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to identify the plant. Please try another clear photo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetApp = () => {
    setSelectedImage(null);
    setPlantData(null);
    setError(null);
    setView(AppView.ANALYZE);
  };

  const isLandingPage = view === AppView.ANALYZE && !selectedImage && !isAnalyzing;

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-white">
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${isLandingPage ? 'bg-emerald-600 border-emerald-500' : 'bg-white/90 backdrop-blur-md border-gray-200/60'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none" 
            onClick={resetApp}
          >
            <div className="relative">
               {isLandingPage ? (
                 <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm ring-1 ring-white/30">
                   <span className="material-icons-round text-2xl text-white">spa</span>
                 </div>
               ) : (
                 <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl text-white shadow-sm">
                   <span className="material-icons-round text-2xl">spa</span>
                 </div>
               )}
            </div>
            <h1 className={`text-2xl font-bold tracking-tight ${isLandingPage ? 'text-white' : 'text-gray-800'}`}>
              Flora<span className={isLandingPage ? 'text-emerald-100' : 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600'}>Lens</span>
            </h1>
          </div>
          
          <nav className={`flex gap-1 p-1.5 rounded-2xl border backdrop-blur-md ${isLandingPage ? 'bg-emerald-700/30 border-emerald-500/30' : 'bg-gray-100/50 border-gray-200/60'}`}>
            <button
              onClick={() => setView(AppView.ANALYZE)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center ${
                view === AppView.ANALYZE 
                  ? (isLandingPage ? 'bg-white text-emerald-700 shadow-sm' : 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5')
                  : (isLandingPage ? 'text-emerald-100 hover:bg-white/10' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50')
              }`}
            >
              <span className="material-icons-round text-lg mr-1.5">center_focus_strong</span>
              Analyze
            </button>
            <button
              onClick={() => setView(AppView.CHAT)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center ${
                view === AppView.CHAT 
                  ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5' 
                  : (isLandingPage ? 'text-emerald-100 hover:bg-white/10' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50')
              }`}
            >
              <span className="material-icons-round text-lg mr-1.5">chat_bubble</span>
              Assistant
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      {isLandingPage ? (
        // FULL WIDTH LANDING PAGE LAYOUT
        <main className="flex-grow w-full flex flex-col">
            {/* Hero Section - Full Width Background */}
            <div className="relative w-full bg-emerald-600 overflow-hidden">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700"></div>
                
                {/* Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-400/30 rounded-full blur-3xl mix-blend-overlay animate-bounce-slow"></div>
                        <div className="absolute bottom-0 -left-24 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl mix-blend-overlay"></div>
                    </div>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-32 md:pt-28 md:pb-40 text-center">
                    <div className="inline-block mb-10 relative group cursor-pointer hover:scale-110 transition-transform duration-500">
                        <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
                        <div className="relative bg-white/10 backdrop-blur-lg border border-white/30 p-6 rounded-3xl shadow-2xl">
                            <span className="material-icons-round text-7xl text-white drop-shadow-md">add_a_photo</span>
                        </div>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm leading-tight">
                        Discover Your <br className="hidden md:block" />
                        <span className="text-emerald-100">Living Garden</span>
                    </h2>
                    
                    <p className="text-emerald-50 text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed opacity-95">
                        Snap a photo to instantly identify plants, get expert care tips, and chat with our AI botanist.
                    </p>
                    
                    <label className="group relative inline-flex items-center justify-center px-8 py-4 md:px-12 md:py-5 font-bold text-emerald-900 transition-all duration-300 bg-white text-lg md:text-xl rounded-full focus:outline-none hover:bg-emerald-50 hover:shadow-2xl hover:shadow-emerald-900/30 hover:-translate-y-1 cursor-pointer overflow-hidden ring-4 ring-white/30 z-20">
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-white to-emerald-50 opacity-100 group-hover:opacity-90 transition-opacity"></span>
                        <span className="relative flex items-center gap-3">
                        <span className="material-icons-round text-3xl group-hover:rotate-12 transition-transform text-emerald-600">upload_file</span>
                        Upload Plant Photo
                        </span>
                        <input 
                        type="file" 
                        accept="image/*, .heic, .heif" 
                        className="hidden" 
                        onChange={handleFileSelect}
                        />
                    </label>
                </div>

                {/* Curvature Divider */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
                    <svg className="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
                    </svg>
                </div>
            </div>

            {/* Features Section - Full Width White */}
            <div className="w-full bg-white py-16 md:py-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Feature 1 */}
                        <div className="flex flex-col items-center text-center group">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300 shadow-sm ring-1 ring-emerald-100">
                            <span className="material-icons-round text-4xl">visibility</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-xl mb-3">Instant ID</h3>
                        <p className="text-gray-500 leading-relaxed font-medium">Identify thousands of plant species in seconds with AI accuracy.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex flex-col items-center text-center group">
                        <div className="w-20 h-20 rounded-3xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-cyan-100 transition-all duration-300 shadow-sm ring-1 ring-cyan-100">
                            <span className="material-icons-round text-4xl">water_drop</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-xl mb-3">Care Guides</h3>
                        <p className="text-gray-500 leading-relaxed font-medium">Get personalized watering, light, and soil schedules.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-20 h-20 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-violet-100 transition-all duration-300 shadow-sm ring-1 ring-violet-100">
                            <span className="material-icons-round text-4xl">forum</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-xl mb-3">Expert Chat</h3>
                        <p className="text-gray-500 leading-relaxed font-medium">Have questions? Chat with our AI botanist for instant advice.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
      ) : (
        // APP LAYOUT - CONSTRAINED
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-20 animate-fade-in">
             {view === AppView.ANALYZE && (
                <div className="w-full">
                    {/* Analysis Mode UI */}
                    <div className="flex flex-col xl:flex-row gap-8 items-start">
                        {/* Left Column: Image */}
                        <div className="w-full xl:w-5/12 flex flex-col gap-6 sticky top-28">
                            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200 border-[6px] border-white bg-gray-100 w-full aspect-[3/4] group ring-1 ring-gray-200">
                                {selectedImage ? (
                                <img 
                                    src={selectedImage} 
                                    alt="Selected plant" 
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                />
                                ) : (
                                <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                                    <div className="w-16 h-16 border-4 border-gray-200 border-t-emerald-400 rounded-full animate-spin mb-4"></div>
                                    <p className="text-sm font-bold uppercase tracking-wider opacity-60">Processing...</p>
                                </div>
                                )}
                                
                                {isAnalyzing && selectedImage && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center z-10">
                                    <div className="relative w-24 h-24 mb-8">
                                    <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="material-icons-round text-4xl animate-pulse text-white">smart_toy</span>
                                    </div>
                                    </div>
                                    <h3 className="font-bold text-3xl tracking-tight mb-3">Analyzing...</h3>
                                    <p className="text-white/90 font-medium text-lg">Identifying species & health</p>
                                </div>
                                )}

                                {!isAnalyzing && (
                                <label className="absolute bottom-6 right-6 bg-white/90 hover:bg-white text-emerald-900 p-4 rounded-2xl shadow-xl cursor-pointer transition-all transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 backdrop-blur-md z-20 hover:scale-110 ring-1 ring-black/5">
                                    <span className="material-icons-round text-2xl">edit</span>
                                    <input 
                                    type="file" 
                                    accept="image/*, .heic, .heif" 
                                    className="hidden" 
                                    onChange={handleFileSelect} 
                                    />
                                </label>
                                )}
                            </div>
                            
                            {!isAnalyzing && plantData && (
                                <div className="bg-emerald-50 rounded-2xl p-5 flex items-center gap-4 border border-emerald-100 shadow-sm">
                                <div className="bg-white p-3 rounded-xl shadow-sm text-emerald-600 ring-1 ring-emerald-100">
                                    <span className="material-icons-round text-2xl">check_circle</span>
                                </div>
                                <div>
                                    <p className="text-emerald-900 font-bold text-base">Analysis Complete</p>
                                    <p className="text-emerald-700/80 text-sm font-medium">Confidence: High</p>
                                </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Right Column: Results */}
                        <div className="w-full xl:w-7/12 text-left">
                            {error ? (
                                <div className="bg-red-50 text-red-700 p-8 rounded-3xl border border-red-100 flex items-start gap-5 shadow-sm animate-slide-up">
                                <div className="bg-red-100 p-3 rounded-full shrink-0">
                                    <span className="material-icons-round text-2xl text-red-600">error_outline</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl mb-2">Identification Failed</h3>
                                    <p className="opacity-90 leading-relaxed mb-6">{error}</p>
                                    <button 
                                        onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                                        className="px-6 py-3 bg-white border border-red-200 text-red-700 rounded-xl text-sm font-bold hover:bg-red-50 hover:shadow-md transition-all"
                                    >
                                    Try Another Photo
                                    </button>
                                </div>
                                </div>
                            ) : plantData ? (
                                <div className="animate-slide-up space-y-8">
                                <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-100/80">
                                    <div className="flex items-center gap-4 px-2">
                                        <div className="h-12 w-1.5 bg-gradient-to-b from-emerald-400 to-teal-600 rounded-full"></div>
                                        <div>
                                        <h3 className="text-xl font-bold text-gray-900">Analysis Report</h3>
                                        <p className="text-sm text-gray-400 font-medium">AI-Generated Results</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setView(AppView.CHAT)}
                                        className="group bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 px-6 py-3 rounded-xl text-gray-700 hover:text-emerald-700 text-sm font-bold transition-all flex items-center shadow-sm hover:shadow-md"
                                    >
                                        <span className="mr-2">Ask Assistant</span>
                                        <span className="material-icons-round text-xl bg-white rounded-full p-1 shadow-sm transition-transform group-hover:translate-x-1 text-emerald-500">arrow_forward</span>
                                    </button>
                                </div>
                                <PlantCard info={plantData} imageUrl={selectedImage || ''} />
                                </div>
                            ) : (
                                !isAnalyzing && (
                                <div className="h-[500px] flex flex-col items-center justify-center text-gray-400 p-10 border-3 border-dashed border-gray-200 bg-gray-50/50 rounded-[2.5rem] hover:bg-gray-50 transition-colors">
                                    <div className="bg-white p-8 rounded-full mb-6 ring-1 ring-gray-100 shadow-sm">
                                        <span className="material-icons-round text-6xl opacity-20">image_search</span>
                                    </div>
                                    <p className="text-2xl font-bold opacity-50">Waiting for image...</p>
                                    <p className="text-base opacity-40 mt-2 font-medium">Upload a photo to begin analysis</p>
                                </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
             )}

            {view === AppView.CHAT && (
                <div className="max-w-4xl mx-auto animate-fade-in w-full">
                    <div className="mb-10 text-center">
                        <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-violet-100 to-fuchsia-50 text-violet-600 rounded-3xl mb-6 shadow-sm transform -rotate-2 hover:rotate-0 transition-transform duration-300 ring-1 ring-violet-100">
                            <span className="material-icons-round text-4xl">smart_toy</span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Gardening Assistant</h2>
                        <div className="bg-white inline-block px-6 py-2.5 rounded-full shadow-sm border border-gray-100">
                            <p className="text-gray-500 font-medium">
                            {plantData 
                                ? <span className="flex items-center gap-2">Topic: <span className="font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-100"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{plantData.commonName}</span></span>
                                : "Your personal AI botanist. Ask about care, pests, or garden planning!"}
                            </p>
                        </div>
                    </div>
                    <ChatBot plantContext={plantData || undefined} />
                </div>
            )}
        </main>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="col-span-1 md:col-span-5 pr-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl text-white shadow-sm">
                  <span className="material-icons-round text-xl">spa</span>
                </div>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">FloraLens</span>
              </div>
              <p className="text-gray-500 leading-relaxed mb-8 text-base font-medium opacity-80">
                Empowering gardeners with artificial intelligence. Identify plants instantly, get detailed care guides, and chat with our expert assistant to grow your perfect garden.
              </p>
            </div>
            
            <div className="col-span-1 md:col-span-3">
              <h4 className="font-bold text-gray-900 mb-6 text-lg">Features</h4>
              <ul className="space-y-4 text-gray-500 font-medium">
                <li className="hover:text-emerald-600 cursor-pointer transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-emerald-400 transition-colors"></span>Plant Identification</li>
                <li className="hover:text-emerald-600 cursor-pointer transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-emerald-400 transition-colors"></span>Care Guides</li>
                <li className="hover:text-emerald-600 cursor-pointer transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-emerald-400 transition-colors"></span>AI Chat Assistant</li>
              </ul>
            </div>

            <div className="col-span-1 md:col-span-4">
              <h4 className="font-bold text-gray-900 mb-6 text-lg">Resources</h4>
              <ul className="space-y-4 text-gray-500 font-medium">
                <li className="hover:text-emerald-600 cursor-pointer transition-colors">Gardening Tips</li>
                <li className="hover:text-emerald-600 cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-emerald-600 cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-emerald-600 cursor-pointer transition-colors">Contact Support</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-100 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400 font-medium">
            <p>&copy; {new Date().getFullYear()} FloraLens AI. All rights reserved.</p>
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full ring-1 ring-gray-100">
              <span className="text-gray-400">Powered by</span>
              <span className="font-bold text-gray-600 flex items-center gap-1">
                <span className="material-icons-round text-base">bolt</span>
                Google Gemini
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;