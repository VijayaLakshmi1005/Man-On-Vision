import React, { useRef, useState, useEffect } from 'react';

const ImageEraser = ({ src, className }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // History for Undo functionality
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = src;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      setImageLoaded(true);
    };
  }, [src]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    // Save current state BEFORE drawing starts, so we can undo back to it
    setHistory(prev => [...prev, canvas.toDataURL()]);
    
    setIsDrawing(true);
    
    // We need to begin a new path immediately at the click position
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    
    erase(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath(); // Reset the path so next stroke doesn't connect
  };

  const erase = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Calculate precise mouse coordinates mapping the screen size to the internal canvas size
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Magic that makes the brush erase instead of draw
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 60; // Much smaller brush size!
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const undo = () => {
    if (history.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const previousState = history[history.length - 1];
    
    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      // Clear canvas and draw the previous state
      ctx.globalCompositeOperation = 'source-over'; 
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // Remove the latest state from history
      setHistory(prev => prev.slice(0, -1));
    };
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `erased-${src.split('/').pop()}`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={erase}
        // Using crosshair cursor: the exact dead-center of the cross is where it erases!
        className="w-full h-full object-contain cursor-crosshair"
        style={{ objectPosition: className.includes('object-[40%_top]') ? '40% top' : 'right bottom' }}
      />
      
      {imageLoaded && (
        <div className="absolute top-[20%] right-[5%] flex flex-col gap-4 z-50 pointer-events-auto">
          <button 
            onClick={undo}
            disabled={history.length === 0}
            className={`px-6 py-3 rounded font-bold transition-colors shadow-xl tracking-widest text-sm uppercase ${
              history.length === 0 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-gray-200 cursor-pointer'
            }`}
          >
            Undo
          </button>
          
          <button 
            onClick={downloadImage}
            className="bg-[#ff0055] text-white px-6 py-3 rounded font-bold hover:bg-black transition-colors shadow-2xl tracking-widest text-sm uppercase cursor-pointer"
          >
            Save Image
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageEraser;
