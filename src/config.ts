// Game Configuration Constants

export const CONFIG = {
  width: 480,
  height: 800,
  gravity: 900,
  
  // Character stats
  characters: {
    aloo: {
      name: 'aloo',
      displayName: 'Aloo',
      speed: 210,       // Slightly slower
      jumpVelocity: -340, // Slightly less jump height
      color: 0xc8963e,  // Golden-brown potato color
      scarfColor: 0xe63946,
      desc: 'Faster speed, standard jump. Loves protein',
      partner: 'bilahi'
    },
    bilahi: {
      name: 'bilahi',
      displayName: 'Bilahi',
      speed: 180,       // Slightly slower
      jumpVelocity: -380, // Slightly less jump height
      color: 0xe63946,  // Red tomato color
      ribbonColor: 0xffb703,
      desc: 'Higher jump, standard speed. Loves pookieness',
      partner: 'aloo'
    }
  },

  // Level progression and physics
  physics: {
    playerFriction: 0.1,
    playerDrag: 800,
    enemySpeed: 40,
    movingPlatformSpeed: 80,
  },

  // Game UI/UX
  ui: {
    primaryColor: '#ffb703',
    secondaryColor: '#fb8500',
    backgroundColor: '#1d3557',
    fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif'
  }
};
