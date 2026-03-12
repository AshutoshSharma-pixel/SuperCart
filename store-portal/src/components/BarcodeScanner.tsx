import { useEffect, useRef } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

interface Props {
    onDetected: (barcode: string) => void
    onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const readerRef = useRef<BrowserMultiFormatReader | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    useEffect(() => {
        let active = true
        async function start() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: { ideal: 1280 } }
                })
                if (!active) { stream.getTracks().forEach(t => t.stop()); return }
                streamRef.current = stream
                if (videoRef.current) videoRef.current.srcObject = stream
                const reader = new BrowserMultiFormatReader()
                readerRef.current = reader
                reader.decodeFromVideoElement(videoRef.current!, (result) => {
                    if (result && active) {
                        onDetected(result.getText())
                        cleanup()
                    }
                })
            } catch (e) {
                console.error('Camera error', e)
            }
        }
        start()
        return () => { active = false; cleanup() }
    }, [])

    function cleanup() {
        streamRef.current?.getTracks().forEach(t => t.stop())
        if (videoRef.current) videoRef.current.srcObject = null
    }

    return (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15 }}>Scan Barcode</span>
                    <button onClick={onClose} style={closeBtn}>✕</button>
                </div>
                <div style={{ position: 'relative', background: '#000', aspectRatio: '1' }}>
                    <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    {/* Corner guides */}
                    <div style={crosshairStyle} />
                </div>
                <div style={statusStyle}>Point camera at a barcode to scan</div>
            </div>
        </div>
    )
}

const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }
const modalStyle: React.CSSProperties = { background: 'white', borderRadius: 16, width: '100%', maxWidth: 400, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }
const headerStyle: React.CSSProperties = { padding: '18px 20px', borderBottom: '1px solid #E8EAF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
const closeBtn: React.CSSProperties = { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#8890AA', lineHeight: 1 }
const crosshairStyle: React.CSSProperties = { position: 'absolute', inset: 0, border: '2px solid rgba(200,168,75,0.6)', margin: '25%', borderRadius: 6, boxShadow: '0 0 0 2000px rgba(0,0,0,0.4)' }
const statusStyle: React.CSSProperties = { padding: '14px 20px', textAlign: 'center', fontSize: 13, color: '#8890AA', background: '#F5F6FA', borderTop: '1px solid #E8EAF0' }
