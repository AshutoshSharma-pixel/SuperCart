export const SCLogo = ({ size = 36, light = false }) => (
    <img
        src="/supercart-logo.png"
        alt="SuperCart Logo"
        style={{
            height: size,
            width: 'auto',
            flexShrink: 0,
            filter: light ? "none" : "invert(1) brightness(2)",
            objectFit: "contain",
            mixBlendMode: light ? "normal" : "screen"
        }}
    />
);
