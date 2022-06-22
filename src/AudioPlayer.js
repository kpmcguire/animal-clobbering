import React, { useEffect, useRef } from 'react';
import { ReactComponent as IconSoundOn } from "./images/icon-sound-on.svg"
import { ReactComponent as IconSoundOff } from "./images/icon-sound-off.svg"
import battleMusicFileM4a from "./audio/battle.m4a";

const AudioPlayer = (props) => {

	const audioRef = useRef(0);

	useEffect(() => {
		if (!props.gameState.musicPlaying) {
			audioRef.current.pause()
		} else {
			audioRef.current.play()
		}
	}, [props.gameState.musicPlaying])

	return (
		<>
			<audio ref={audioRef} className="music-player" loop="true" preload="auto">
				<source src={battleMusicFileM4a} type="audio/mp4"></source>
			</audio>
			
			<button className="button-audio-toggle" onClick={props.toggleAudio}>
				<div className="button-inner svg-icon">
					{props.gameState.audioEnabled ? <IconSoundOn/> : <IconSoundOff/>}
				</div>
			</button>
			
		</>

	)
}

export default AudioPlayer