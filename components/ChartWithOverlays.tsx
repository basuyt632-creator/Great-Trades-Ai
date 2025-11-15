import React, { useRef, useEffect } from 'react';
import type { TrendLine } from '../types';

interface ChartWithOverlaysProps {
    imageUrl: string;
    trendLines: TrendLine[];
    theme: 'light' | 'dark';
}

const LINE_STYLES: Record<TrendLine['type'], { color: string; dash: number[] }> = {
    support: { color: 'rgb(34, 197, 94)', dash: [] }, // green-500
    resistance: { color: 'rgb(239, 68, 68)', dash: [] }, // red-500
    trend: { color: 'rgb(59, 130, 246)', dash: [10, 5] }, // blue-500
};


export const ChartWithOverlays: React.FC<ChartWithOverlaysProps> = ({ imageUrl, trendLines, theme }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const image = imageRef.current;
        if (!canvas || !image || !trendLines) return;

        const draw = () => {
            if (!image.naturalWidth || !image.naturalHeight) {
                // Image not loaded yet, wait for onload
                return;
            }
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            // Match canvas dimensions to the actual image dimensions for 1:1 drawing
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            trendLines.forEach(line => {
                if (!line.points || line.points.length < 2) return;
                
                const style = LINE_STYLES[line.type];
                
                // Apply a shadow for better visibility on any background
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                // Draw the line
                ctx.beginPath();
                ctx.moveTo(line.points[0].x, line.points[0].y);
                ctx.lineTo(line.points[1].x, line.points[1].y);
                ctx.strokeStyle = style.color;
                ctx.lineWidth = Math.max(2.5, canvas.width / 350); // Scale line width
                ctx.setLineDash(style.dash);
                ctx.stroke();

                // --- Draw Label ---
                const fontSize = Math.max(14, canvas.width / 65);
                ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                
                const midX = (line.points[0].x + line.points[1].x) / 2;
                const midY = (line.points[0].y + line.points[1].y) / 2;
                
                ctx.save();
                ctx.translate(midX, midY);
                const angle = Math.atan2(line.points[1].y - line.points[0].y, line.points[1].x - line.points[0].x);
                
                // Keep text relatively horizontal for readability, only flip 180 degrees
                const rotation = angle > Math.PI / 2 || angle < -Math.PI / 2 ? angle + Math.PI : angle;
                ctx.rotate(rotation);
                
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                
                const textMetrics = ctx.measureText(line.label);
                const padding = 8;

                // Turn off shadow for the background rect
                ctx.save();
                ctx.shadowColor = 'transparent';

                const labelBgColor = theme === 'dark'
                    ? 'rgba(12, 16, 29, 0.75)' // --bg-color-dark
                    : 'rgba(248, 250, 252, 0.75)'; // --bg-color-light

                ctx.fillStyle = labelBgColor;
                ctx.fillRect(
                    -textMetrics.width / 2 - padding / 2, 
                    -fontSize - padding, 
                    textMetrics.width + padding, 
                    fontSize + padding
                );
                ctx.restore();

                // Draw text with shadow
                ctx.fillStyle = style.color;
                ctx.fillText(line.label, 0, -5);
                
                ctx.restore();
            });
        };
        
        // Redraw when image loads
        const handleLoad = () => {
            draw();
        };

        if (image.complete && image.naturalWidth > 0) {
            draw();
        } else {
            image.addEventListener('load', handleLoad);
        }
        
        return () => {
            if(image) {
                image.removeEventListener('load', handleLoad);
            }
        }

    }, [imageUrl, trendLines, theme]);

    return (
        <div className="relative w-full border border-border-color rounded-lg overflow-hidden bg-bg-color-alt">
            <img ref={imageRef} src={imageUrl} alt="Analyzed chart" className="w-full h-auto block" crossOrigin="anonymous" />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none"></canvas>
        </div>
    );
};