export default function SignalRibbonBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{
          maskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 65%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 65%)',
        }}
      >
        <div
          className="absolute rounded-full ribbon-bloom-primary"
          style={{
            width: '600px',
            height: '600px',
            top: '-80px',
            left: '-120px',
            background: 'radial-gradient(circle, rgba(74,143,168,0.06) 0%, rgba(74,143,168,0.02) 50%, transparent 70%)',
          }}
        />

        <div
          className="absolute rounded-full ribbon-bloom-secondary"
          style={{
            width: '500px',
            height: '500px',
            top: '40px',
            right: '-60px',
            background: 'radial-gradient(circle, rgba(194,143,148,0.05) 0%, rgba(194,143,148,0.015) 50%, transparent 70%)',
          }}
        />

        <div
          className="absolute rounded-full"
          style={{
            width: '350px',
            height: '350px',
            top: '200px',
            left: '30%',
            background: 'radial-gradient(circle, rgba(194,143,148,0.03) 0%, transparent 60%)',
          }}
        />

        <svg
          className="absolute inset-0 w-full h-full ribbon-drift"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMin slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="ribbon-a" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(74,143,168,0)" />
              <stop offset="15%" stopColor="rgba(74,143,168,0.06)" />
              <stop offset="50%" stopColor="rgba(74,143,168,0.08)" />
              <stop offset="85%" stopColor="rgba(74,143,168,0.04)" />
              <stop offset="100%" stopColor="rgba(74,143,168,0)" />
            </linearGradient>
            <linearGradient id="ribbon-b" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(194,143,148,0)" />
              <stop offset="20%" stopColor="rgba(194,143,148,0.055)" />
              <stop offset="50%" stopColor="rgba(194,143,148,0.07)" />
              <stop offset="80%" stopColor="rgba(194,143,148,0.035)" />
              <stop offset="100%" stopColor="rgba(194,143,148,0)" />
            </linearGradient>
            <linearGradient id="ribbon-c" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(74,143,168,0)" />
              <stop offset="25%" stopColor="rgba(74,143,168,0.035)" />
              <stop offset="50%" stopColor="rgba(74,143,168,0.05)" />
              <stop offset="75%" stopColor="rgba(74,143,168,0.025)" />
              <stop offset="100%" stopColor="rgba(74,143,168,0)" />
            </linearGradient>
          </defs>

          <path
            d="M -50 180 C 150 120, 300 280, 500 200 S 800 100, 1000 220 S 1150 280, 1260 180"
            stroke="url(#ribbon-a)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M -50 220 C 180 300, 350 140, 520 240 S 780 340, 980 200 S 1120 160, 1260 240"
            stroke="url(#ribbon-b)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          <path
            d="M -50 200 C 200 160, 400 260, 600 190 S 850 130, 1050 210 S 1180 250, 1260 200"
            stroke="url(#ribbon-c)"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.5"
          />

          <path
            d="M -30 160 C 120 190, 240 150, 380 180 S 530 210, 650 170"
            stroke="url(#ribbon-a)"
            strokeWidth="0.6"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            d="M 550 250 C 700 220, 850 270, 1000 230 S 1120 200, 1250 250"
            stroke="url(#ribbon-b)"
            strokeWidth="0.6"
            strokeLinecap="round"
            opacity="0.3"
          />
        </svg>
      </div>

      <div
        className="absolute inset-0"
        style={{
          top: '65%',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
        }}
      >
        <div
          className="absolute rounded-full ribbon-bloom-tertiary"
          style={{
            width: '400px',
            height: '400px',
            top: '20px',
            left: '20%',
            background: 'radial-gradient(circle, rgba(194,143,148,0.035) 0%, transparent 65%)',
          }}
        />

        <svg
          className="absolute inset-0 w-full h-full ribbon-drift-echo"
          viewBox="0 0 1200 400"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M -50 180 C 200 130, 400 230, 600 170 S 900 120, 1100 200 S 1200 220, 1260 180"
            stroke="url(#ribbon-a)"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M -50 210 C 180 270, 380 150, 580 220 S 850 280, 1050 190 S 1200 170, 1260 220"
            stroke="url(#ribbon-b)"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </div>
    </div>
  );
}
