export const useSound = () => {
  const playSound = (type) => {
    const sounds = {
      click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
      error: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      move: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
    };

    if (sounds[type]) {
      const audio = new Audio(sounds[type]);
      audio.volume = 0.4;
      audio.play().catch(e => console.log('Sound blocked by browser'));
    }
  };

  return { playSound };
};
