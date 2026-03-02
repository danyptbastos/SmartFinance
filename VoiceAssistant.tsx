
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, MicOff, Loader2, X, Volume2, Sparkles, Zap } from 'lucide-react';
import { decode, encode, decodeAudioData } from './geminiService';

interface VoiceAssistantProps {
  onClose: () => void;
  onTransactionDetected: (text: string) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onClose, onTransactionDetected }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [transcript, setTranscript] = useState('');
  const inputAudioCtx = useRef<AudioContext | null>(null);
  const outputAudioCtx = useRef<AudioContext | null>(null);
  const nextStartTime = useRef(0);
  const sources = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let stream: MediaStream;
    let processor: ScriptProcessorNode;
    
    const connect = async () => {
      try {
        // Use separate contexts for input (16kHz) and output (24kHz) as per guidelines
        inputAudioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            systemInstruction: 'Você é um assistente financeiro de elite. Quando o usuário disser que gastou ou recebeu algo, responda confirmando de forma extremamente curta e finalize dizendo "REGISTRADO: [descrição do que ele disse]".',
            inputAudioTranscription: {},
            outputAudioTranscription: {}
          },
          callbacks: {
            onopen: () => {
              setIsConnecting(false);
              setIsActive(true);
              const source = inputAudioCtx.current!.createMediaStreamSource(stream);
              processor = inputAudioCtx.current!.createScriptProcessor(4096, 1, 1);
              processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const int16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
                
                // CRITICAL: Ensure we use the resolved session to send input
                sessionPromise.then(session => session.sendRealtimeInput({ 
                  media: { 
                    data: encode(new Uint8Array(int16.buffer)), 
                    mimeType: 'audio/pcm;rate=16000' 
                  } 
                }));
              };
              source.connect(processor);
              processor.connect(inputAudioCtx.current!.destination);
            },
            onmessage: async (msg) => {
              // Process output audio chunks
              if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
                const base64Audio = msg.serverContent.modelTurn.parts[0].inlineData.data;
                nextStartTime.current = Math.max(nextStartTime.current, outputAudioCtx.current!.currentTime);
                
                const audioBuffer = await decodeAudioData(
                  decode(base64Audio),
                  outputAudioCtx.current!,
                  24000,
                  1
                );
                
                const source = outputAudioCtx.current!.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioCtx.current!.destination);
                
                source.addEventListener('ended', () => {
                  sources.current.delete(source);
                });

                source.start(nextStartTime.current);
                nextStartTime.current += audioBuffer.duration;
                sources.current.add(source);
              }

              // Handle model interruption
              if (msg.serverContent?.interrupted) {
                for (const source of sources.current.values()) {
                  try { source.stop(); } catch (e) {}
                  sources.current.delete(source);
                }
                nextStartTime.current = 0;
              }

              // Handle user and model transcription
              if (msg.serverContent?.inputTranscription?.text) {
                const text = msg.serverContent.inputTranscription.text;
                setTranscript(prev => prev + ' ' + text);
              }

              if (msg.serverContent?.outputTranscription?.text) {
                const text = msg.serverContent.outputTranscription.text;
                if (text.toUpperCase().includes('REGISTRADO:')) {
                    onTransactionDetected(text);
                }
              }
            },
            onclose: () => setIsActive(false),
            onerror: (e) => console.error(e)
          }
        });
      } catch (err) {
        console.error(err);
        onClose();
      }
    };

    connect();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
      processor?.disconnect();
      inputAudioCtx.current?.close();
      outputAudioCtx.current?.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#090909]/95 backdrop-blur-xl z-[60] flex flex-col items-center justify-center p-8 text-white text-center animate-in fade-in duration-300">
      <button onClick={onClose} className="absolute top-10 right-10 glass-card w-14 h-14 bg-white/5 hover:bg-white/10 transition-all border-white/5 flex items-center justify-center">
        <X size={28} />
      </button>

      <div className={`w-48 h-48 rounded-full flex items-center justify-center mb-12 transition-all duration-700 relative ${isActive ? 'bg-[#A3FF47]/5 shadow-[0_0_100px_rgba(163,255,71,0.1)] scale-105 border border-[#A3FF47]/20' : 'bg-white/5'}`}>
        {isConnecting ? (
            <Loader2 className="animate-spin text-[#A3FF47]" size={64} strokeWidth={1} />
        ) : (
            <>
                <div className="absolute inset-0 bg-[#A3FF47]/5 rounded-full animate-ping duration-[2000ms]"></div>
                <Zap className="text-[#A3FF47] animate-pulse shadow-glow" size={64} strokeWidth={1.5} />
            </>
        )}
      </div>

      <div className="space-y-4 mb-16">
        <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles size={18} className="text-[#A3FF47]" />
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                {isConnecting ? 'Inicializando...' : 'Escuta Ativa'}
            </h2>
        </div>
        <p className="text-zinc-600 font-bold uppercase tracking-[0.5em] text-[10px]">Protocolo de Entrada Vocal V3.0</p>
      </div>
      
      <div className="glass-card p-12 w-full max-w-2xl border-white/5 min-h-[200px] flex flex-col justify-center items-center bg-white/[0.01]">
        <p className="text-[10px] text-[#A3FF47]/60 mb-8 uppercase tracking-[0.5em] font-black italic">Fluxo Síncrono Detectado</p>
        <p className="italic text-2xl font-medium text-zinc-300 leading-relaxed tracking-tight">
            {transcript || 'Ouvindo o seu comando...'}
        </p>
      </div>
      
      <div className="mt-20">
         <button onClick={onClose} className="px-16 py-5 rounded-2xl border border-white/5 bg-white/5 text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px] hover:text-white hover:bg-white/10 transition-all">
           Cancelar Sessão
         </button>
      </div>
    </div>
  );
};

export default VoiceAssistant;
