
import React, { useState, useEffect, useRef } from 'react';


const MusicPlayer = ({url, parentIsPlaying}) => {
  const [playing, setPlaying] = useState(parentIsPlaying);
  const audioRef = useRef(new Audio(url));
  
  const handleSetPlaying = () => setPlaying(parentIsPlaying)

  useEffect(() => {
  	setPlaying(parentIsPlaying);
  }, [parentIsPlaying]);

  useEffect(() => {
	console.log(audioRef)
	audioRef.current[playing ? "play" : "pause"]();
	audioRef.current.loop = true;
  }, [playing]);

  return (
	<div>
	  <button onClick={() => setPlaying(!playing)}>
		{playing ? "Pause" : "Play"}
	  </button>
	</div>
  );
};

export default MusicPlayer;