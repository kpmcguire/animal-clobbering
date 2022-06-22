import React, { useState, useEffect, useRef } from 'react';
import './scss/App.scss';
import './scss/_fonts.scss';
import Character from "./Character";
import Modal from "./Modal";
import ModalSelectPlayer from "./ModalSelectPlayer";
import Dialog from "./Dialog";

import {ReactComponent as Blob} from "./images/blob.svg"
import {ReactComponent as IconSoundOn} from "./images/icon-sound-on.svg"
import {ReactComponent as IconSoundOff} from "./images/icon-sound-off.svg"
import {ReactComponent as IconVideoOn} from "./images/icon-film-on.svg"
import {ReactComponent as IconVideoOff} from "./images/icon-film-off.svg"


import WebFont from "webfontloader";

import battleMusicFileM4a from "./audio/battle.m4a";
import attackFile from "./audio/attack1.m4a";
import enemyHitFile from "./audio/enemyhit.m4a";
import enemyAttackFile from "./audio/enemyattack.m4a";
import bumpFile from "./audio/bump.m4a";
import winFile from "./audio/enemydie.m4a";
import healFile from "./audio/heal.m4a";
import statsupFile from "./audio/statsup.m4a";
import ailmentFile from "./audio/ailment.m4a";

import bg1 from "./images/bg-1.mp4"
import bg2 from "./images/bg-2.mp4"
import bg3 from "./images/bg-3.mp4"

let timers = []

let audioTracks = []

let shit_list = {
  snooty: ["jock", "lazy", "normal"],
  uchi: ["smug", "snooty", "normal"],
  peppy: ["snooty", "cranky", "normal"],
  cranky: ["peppy", "normal"],
  smug: ["cranky", "lazy", "normal"],
  jock: ["snooty", "cranky", "lazy", "normal"],
  lazy: ["jock", "snooty", "normal"],
  normal: ["normal"]
}

function App() {

  const [characters, setCharacters] = useState({});
  const [count, setCount] = useState();
  
  const [startingCharacters, setStartingCharacters] = useState([]);
  
  const [playerCharacter, setPlayerCharacter] = useState({});
  const [enemyCharacter, setEnemyCharacter] = useState({});
  
  const playerRef = useRef(playerCharacter);
  const enemyRef = useRef(enemyCharacter);
  playerRef.current = playerCharacter;
  enemyRef.current = enemyCharacter;
  
  const videoRef = useRef(0);
  const audioRef = useRef(0);
    
  audioTracks["attack1"] = new Audio(attackFile)
  audioTracks["enemyHit"] = new Audio(enemyHitFile)
  audioTracks["enemyAttack"] = new Audio(enemyAttackFile) 
  audioTracks["bump"] = new Audio(bumpFile) 
  audioTracks["win"] = new Audio(winFile)
  audioTracks["heal1"] = new Audio(healFile)
  audioTracks["statsup"] = new Audio(statsupFile)
  audioTracks["ailment"] = new Audio(ailmentFile)
   
  const initialTaunts = [    
    "You dare to defy me?",
    "Give up already.",
    "Take this!",
    "I need more souls!",
    "Don't scream! Worms!",
    "Nothing personal, but I must win.",
    "You're quite the rude one.",
    "Don't cry for mercy.",
    "I can't lose!",
    "WAAAAACHAAA!",
    "Talk is cheap in battle!",
    "You picked the wrong animal to mess with!",
    "Last chance if you want to quit!",
    "Show me what you got!",
    "Okay, I'm not going to hold back!",
    "Don't worry, it'll be over soon.",
    "You're in my way!"
  ];
  
  const [taunts, setTaunts] = useState({
    selectedTaunt: "",
    baseTaunts: [""]
  });
  
  const [gameState, setGameState] = useState({
    playerDead: true,
    enemyDead: false,
    audioEnabled: false,
    streak: 1,
    bgChoice: 0,
    introShown: false,
    disabled: true
  });
    
  useEffect(()=>{
    WebFont.load({
      custom: {
        families: ["Seurat", "Fink", "Rodin"],
        urls: ["/fonts.css"]
      }
    })
    
    async function fetchData() {
      const response = await fetch("https://acnhapi.com/v1/villagers");
      const char = await response.json();
            
      setCharacters(char)
      var listKeys = Object.keys(char);
      setCount(listKeys.length)
      
    }
    fetchData();
    
    let randomBgChoice = getDiceRoll(1, 3);
    
    switch(randomBgChoice) {
        case 1:
          setGameState((gs) => ({...gs, bgChoice: bg1 }));
          break;
        case 2:
          setGameState((gs) => ({...gs, bgChoice: bg2 }));
          break;
        case 3:
          setGameState((gs) => ({...gs, bgChoice: bg3 }));
          break;
        default:
          setGameState((gs) => ({...gs, bgChoice: bg3 }));
    }
  }, [])
  
  useEffect(()=>{
    enemyApproaches();

    if(characters) {
      chooseStartingCharacters()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps    
  }, [count, characters])
  
  useEffect(()=>{
    if(videoRef.current) {    
      if(!gameState.videoPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }, [gameState.videoPlaying])
  
  useEffect(()=>{
    if(!gameState.musicPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }, [gameState.musicPlaying]) 
  
  useEffect(()=>{
    enemyChooseAction()    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemyCharacter.saying])
    
  useEffect(()=>{
    if (enemyCharacter.hitPoints <= 0) {
      setEnemyCharacter((ec) => ({...ec, hitPoints: 0}));      
      setGameState((gs) => ({...gs, enemyDead: true, disabled: true}));
      
      document.querySelector(".enemy-character-wrapper img").classList.add("disappear")
      
      playAudio(audioTracks["win"])
      
      clearAllTimers()
    }
    
    if (enemyCharacter.hitPoints >=  enemyCharacter.maxHitPoints) {
      setEnemyCharacter((ec) => ({...ec, hitPoints: ec.maxHitPoints}));      
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemyCharacter.hitPoints, enemyCharacter.maxHitPoints])
  
  useEffect(()=>{
      setGameState((gs) => ({...gs, streak: gs.streak++}));
  }, [gameState.enemyDead])
  
  
  useEffect(()=>{
    if (playerCharacter.hitPoints <= 0) {
      setPlayerCharacter((pc) => ({...pc, hitPoints: 0}));      
      setEnemyCharacter((ec) => ({...ec, power: 10, defense: 10}));      

      setGameState((gs) => ({...gs, playerDead: true, disabled: true}));
      
      chooseStartingCharacters()
      
      clearAllTimers()
    }
    
    if (playerCharacter.hitPoints >= playerCharacter.maxHitPoints) {
      setPlayerCharacter((ec) => ({...ec, hitPoints: ec.maxHitPoints}));      
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerCharacter.hitPoints, playerCharacter.maxHitPoints])
  
  useEffect(()=>{
    setTaunts(() => ({baseTaunts: [...initialTaunts, playerCharacter.saying]}));
    setTaunts(() => ({baseTaunts: [...initialTaunts, playerCharacter["catch-phrase"]]}));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerCharacter.saying])  
  
  const chooseStartingCharacters = () => {
    setStartingCharacters(sc => [getRandomCharacter(characters), getRandomCharacter(characters), getRandomCharacter(characters)])  
  }
  
  const enemyChooseAction = ()=>{
    let enemyAction = getDiceRoll(1,5);
    
    switch(enemyAction) {
      case 1:
      case 2:
      case 3:
        setEnemyCharacter((ec) => ({...ec, action: "attack" }));
        break;
      case 4:
        let enemyDefensePower = getDiceRoll(1, 6)
        setEnemyCharacter((ec) => ({...ec, action: "defend", defense: enemyRef.current.defense + 10 + enemyDefensePower + gameState.streak }));
        break;
      case 5:
        setEnemyCharacter((ec) => ({...ec, action: "nothing" }));
        break;
      default: 
        setEnemyCharacter((ec) => ({...ec, action: "attack" }));
    }
  }
  
  const getRandomCharacter = (chars) => {
    var listKeys = Object.keys(chars);    
    var randomIndex = Math.floor(Math.random() * listKeys.length);
    var randomObject = chars[listKeys[randomIndex]];
    return randomObject;
  }
  
  
  
  const enemyApproaches = () => {
    if(characters !== undefined) {
      let rc = getRandomCharacter(characters)
      
      if(rc !== undefined) {
        setEnemyCharacter(rc);
        let hp = 10 + hashCode(rc.name["name-USen"])
        
        setEnemyCharacter((ec) => ({...ec, hitPoints: hp, maxHitPoints: hp, power: 10, defense: 10}));      
      }
    } 
  }
  
  const initPlayer = (char) => {
    setPlayerCharacter(char);
    let hp = 10 + hashCode(char.name["name-USen"])
    setPlayerCharacter((ec) => ({...ec, hitPoints: hp, maxHitPoints: hp, power: 10, defense: 10}));      
    setGameState((gs) => ({...gs, playerDead: false, disabled: false, streak: 1 }));
    setTaunts((t)=>({...t, selectedTaunt: ""}));    
    
    if(document.querySelector(".player-character-wrapper img")) {
      document.querySelector(".player-character-wrapper img").classList.remove("moveright")
      document.querySelector(".player-character-wrapper img").classList.remove("moveleft")
      document.querySelector(".enemy-character-wrapper img").classList.remove("moveright")
      document.querySelector(".enemy-character-wrapper img").classList.remove("moveleft")    
      document.querySelector(".enemy-character-wrapper .player-action-buttons").style = "display: block";
    }
  }
  
  const initEnemy = () => {
    setGameState((gs) => ({...gs, enemyDead: false, disabled: false}));
    setPlayerCharacter((ec) => ({...ec, power: 10, defense: 10}));      
    setTaunts((t)=>({...t, selectedTaunt: ""}));    
    
    if(document.querySelector(".enemy-character-wrapper img")) {
      document.querySelector(".player-character-wrapper img").classList.remove("moveright")
      document.querySelector(".player-character-wrapper img").classList.remove("moveleft")
      document.querySelector(".enemy-character-wrapper img").classList.remove("moveright")
      document.querySelector(".enemy-character-wrapper img").classList.remove("moveleft")
      
      timers.push(    
        setTimeout(()=>{
          document.querySelector(".enemy-character-wrapper img").classList.remove("disappear")
          document.querySelector(".enemy-character-wrapper .player-action-buttons").style = "display: block";
        }, 500)
      );     
      
    }

    enemyApproaches();
  }  
  
  const getDiceRoll = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  const defend = () => {
    enemyChooseAction()

    document.querySelector(".enemy-character-wrapper .player-action-buttons").style = "display: none";
    setGameState((gs) => ({...gs, disabled: true}));
    
    document.querySelector(".player-character-wrapper img").classList.add("movedown")


    playAudio(audioTracks["statsup"])

    let playerDefensePower = getDiceRoll(1,6);
    setPlayerCharacter((pc) => ({...pc, defense: 10 + playerDefensePower, power: 0 }));
        
    timers.push(    
      setTimeout(()=>{
        document.querySelector(".player-character-wrapper img").classList.remove("movedown")
      }, 1000)
    );        
        
    timers.push(setTimeout(()=>{enemyAction()}, 1300));
  }
  
  const heal = () => {
    enemyChooseAction()

    document.querySelector(".enemy-character-wrapper .player-action-buttons").style = "display: none";
    setGameState((gs) => ({...gs, disabled: true}));

    document.querySelector(".player-character-wrapper img").classList.add("moveup")
    


    playAudio(audioTracks["heal1"])
    setPlayerCharacter((pc) => ({...pc, hitPoints: pc.hitPoints + 10 + getDiceRoll(1, 10) }));

    timers.push(    
      setTimeout(()=>{
        document.querySelector(".player-character-wrapper img").classList.remove("moveup")
      }, 1000)
    );     

    timers.push(setTimeout(()=>{enemyAction()}, 1300));

  }

  const playAudio = (audio) => {
    if(gameState.audioEnabled) {
      audio.play()
    }    
  }

  const attack = () => {
    enemyChooseAction()

    document.querySelector(".enemy-character-wrapper .player-action-buttons").style = "display: none";
    setGameState((gs) => ({...gs, disabled: true}));

    let chanceToSpeak = getDiceRoll(1, 3);
      
    if (chanceToSpeak === 3) {
      let dieRoll = getDiceRoll(0, taunts.baseTaunts.length-1)
      setTaunts((t)=>({...t, selectedTaunt: taunts.baseTaunts[dieRoll]}));          
    }
    
    let modifier = 1;
    let matchup = [playerCharacter.personality, enemyCharacter.personality]
    let weakness = shit_list[matchup[0].toLowerCase()]
    
    if(weakness !== undefined) {
      if (weakness.includes(matchup[1].toLowerCase())) {
        modifier = 2
      }
    }
    
    setPlayerCharacter((pc) => ({...pc, power: (playerRef.current.power + gameState.streak) * modifier }));

      document.querySelector(".player-character-wrapper img").classList.add("moveright")

      playAudio(audioTracks["attack1"]);



      timers.push(
        setTimeout(()=>{
          document.querySelector(".enemy-character-wrapper img").classList.add("moveright")
          
          let playerAttackPower = getDiceRoll(1,6);
          
          let thisAttack = (playerAttackPower + playerRef.current.power);
          console.log(thisAttack, playerRef.current.power, playerCharacter.power)
          
          if (thisAttack < 0) {
            thisAttack = 0;
          }
           
          let enemyDefense = enemyRef.current.defense
          
          if (enemyDefense > thisAttack ) {
            enemyDefense = thisAttack;
          }
          
          setEnemyCharacter((ec) => ({...ec, hitPoints: enemyCharacter.hitPoints - (thisAttack - enemyDefense) })); 
        }, 300)
      );

      timers.push(
        setTimeout(()=>{
          playAudio(audioTracks["enemyHit"]);
        }, 400)
      );

      timers.push(    
        setTimeout(()=>{
          document.querySelector(".player-character-wrapper img").classList.remove("moveright")
        }, 1000)
      );
      
      timers.push(
        setTimeout(()=>{
          setTaunts((t)=>({...t, selectedTaunt: ""}));
        }, 1200)
      );
      
      timers.push(
        setTimeout(()=>{
          document.querySelector(".enemy-character-wrapper img").classList.remove("moveright")
          enemyAction()
        }, 1300)
      );
  }
  
  function enemyAction() {
    
switch (enemyCharacter.action) {
  case "attack":

    document.querySelector(".enemy-character-wrapper img").classList.add("moveleft")

    document.querySelector(".enemy-character-wrapper .player-action-buttons").style = "display: none";
    let modifier = 1;
    let matchup = [enemyCharacter.personality, playerCharacter.personality]
    let weakness = shit_list[matchup[0].toLowerCase()]
    
    if(weakness !== undefined) {
      if (weakness.includes(matchup[1].toLowerCase())) {
        modifier = 2
      }
    }
    
    setEnemyCharacter((ec) => ({...ec, power: (enemyRef.current.power + gameState.streak + 5) * modifier }));

    playAudio(audioTracks["enemyAttack"]);


    
    timers.push(

      setTimeout(() => {
        document.querySelector(".player-character-wrapper img").classList.add("moveleft")
        
        let enemyAttackPower = getDiceRoll(1, 6);
        
        let thisAttack = (enemyAttackPower + enemyRef.current.power);
        
        thisAttack = thisAttack - playerRef.current.defense
        
        if (thisAttack < 0) {
          thisAttack = 0;
        }
        
        let playerDefense = playerRef.current.defense
        
        if (playerDefense > thisAttack ) {
          playerDefense = thisAttack;
        }

        setPlayerCharacter((pc) => ({...pc, hitPoints: playerCharacter.hitPoints - (thisAttack - playerDefense)  }));
      }, 300)
    );

    timers.push(
      setTimeout(() => {
        playAudio(audioTracks["bump"]);
      }, 400)
    );

    timers.push(
      setTimeout(() => {
        document.querySelector(".enemy-character-wrapper img").classList.remove("moveleft")
      }, 1000)
    );

    timers.push(
      setTimeout(() => {
        document.querySelector(".player-character-wrapper img").classList.remove("moveleft")
        setPlayerCharacter((pc) => ({ ...pc, power: 10, defense: 10 }));
        setEnemyCharacter((ec) => ({...ec, power: 10, defense: 10 })); 

        setGameState((gs) => ({ ...gs, disabled: false }));
        document.querySelector(".enemy-character-wrapper .player-action-buttons").style = "display: block";

      }, 1100)
    );

    break;
  case "defend":

    document.querySelector(".enemy-character-wrapper img").classList.add("movedown")
    playAudio(audioTracks["statsup"])

    timers.push(
      setTimeout(() => {
        setGameState((gs) => ({ ...gs, disabled: false }));
        document.querySelector(".enemy-character-wrapper .player-action-buttons").style = "display: block";
        document.querySelector(".enemy-character-wrapper img").classList.remove("movedown");
        setEnemyCharacter((ec) => ({...ec, power: 10, defense: 10 })); 
        setPlayerCharacter((pc) => ({ ...pc, power: 10, defense: 10 }));

      }, 1100)
    )

    break;
  case "nothing":
    playAudio(audioTracks["ailment"])
    document.querySelector(".enemy-character-wrapper img").classList.add("confused")

    timers.push(
      setTimeout(() => {
        setGameState((gs) => ({ ...gs, disabled: false }));
        document.querySelector(".enemy-character-wrapper .player-action-buttons").style = "display: block";
        document.querySelector(".enemy-character-wrapper img").classList.remove("confused")
        setEnemyCharacter((ec) => ({...ec, power: 10, defense: 10 }));
        setPlayerCharacter((pc) => ({ ...pc, power: 10, defense: 10 })); 
      }, 1100)
    );

    break;
  default:

    setEnemyCharacter((ec) => ({ ...ec, power: 10, defense: 10 }));

    timers.push(
      setTimeout(() => {
        setPlayerCharacter((pc) => ({ ...pc, power: 10, defense: 10 }));
        setEnemyCharacter((ec) => ({ ...ec, power: 10, defense: 10 }));
        setGameState((gs) => ({ ...gs, disabled: false }));
        document.querySelector(".enemy-character-wrapper .player-action-buttons").style = "display: block";
      }, 1100)
    );
}
}
  
  const toggleAudio = () => {

    setGameState((gs) => ({...gs, audioEnabled: !gameState.audioEnabled, musicPlaying: !gameState.musicPlaying}));
  }
  
  const toggleVideoPlaying = () => {
      setGameState((gs) => ({...gs, videoPlaying: !gameState.videoPlaying}));
  }
  
  const clearAllTimers = () => {

    timers.forEach((timer) => {
      clearTimeout(timer);
    });  
    setPlayerCharacter((pc) => ({ ...pc, power: 10, defense: 10 }));
    setEnemyCharacter((ec) => ({ ...ec, power: 10, defense: 10 }));
    setGameState((gs) => ({ ...gs, disabled: true }));
  }
  
  function hashCode(str) {
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; 
    }
    
    let num = hash.toString();
    num = num.substring(0, 2);
    num = Number(num);
    return Math.abs(num);
  };
  
  return (
    <div className="App">
      <header className="app-header wood-texture">
        <h1>Animal <wbr/> Clobbering</h1>
        
        <div className="header-buttons">          
          <button className="button-audio-toggle" onClick={toggleAudio}>
            <div className="button-inner svg-icon">
              {gameState.audioEnabled ? <IconSoundOn/> : <IconSoundOff/>}
            </div>
          </button>
          
          <button className="button-video-toggle" onClick={toggleVideoPlaying}>
            <div className="button-inner svg-icon">
              {gameState.videoPlaying ?  <IconVideoOn/> : <IconVideoOff/>}
            </div>
          </button>  
        </div>
        
      </header>
      <main>
      <Blob className="hide-me" />
      
      {gameState.bgChoice && 
        <video ref={videoRef} className="animated-background" src={gameState.bgChoice} loop="true" muted="true" preload="auto" />  
      }
      
      
      <audio ref={audioRef} className="music-player" loop="true" preload="auto">
        <source src={battleMusicFileM4a} type="audio/mp4"></source>
      </audio>






      {gameState.enemyDead === true &&
        <Modal 
          messageTextTitle="You won!" 
          messageTextBody="The carnage must continue..." 
          buttonText="Go again?" 
          buttonAction={initEnemy}
        />
      }
      
      {gameState.enemyDead === true && gameState.streak > 20 &&
        <Modal 
          messageTextTitle="It's over" 
          messageTextBody="All the other animals are dead. And you killed them. You are the ultimate champion." 
          buttonText="The End" 
          buttonAction={()=>{console.log("The end")}}
        />
      }

      {gameState.playerDead && startingCharacters && startingCharacters[0] !== undefined && gameState.introShown === true &&
        <ModalSelectPlayer messageTextTitle="Choose your combatant" startingCharacters={startingCharacters} initPlayer={initPlayer}></ModalSelectPlayer>
      }
      
      {gameState.introShown === false &&
        <Modal 
          messageTextTitle="Animal Clobbering" 
          messageTextBody="These animals are not friends. Secretly, they hate each other, and given the tiniest chance they will fight to the death. Will you be that chance?" 
          buttonText="Commence the bloodbath!" 
          buttonAction={()=>{setGameState((gs) => ({...gs, introShown: true }))}}
        />
      }
      
      <div className="grid grid-cols-11 battle-arena mx-auto max-w-5xl">
      
      <div className="player-character-wrapper col-span-5">
        {playerCharacter && playerCharacter.name && playerCharacter.image_uri &&
          <>
          <Character char={playerCharacter} textColor={playerCharacter["text-color"]} bubbleColor={playerCharacter["bubble-color"]}/>
            <div className="player-action-buttons">
            
              <button className="button-attack" onClick={attack} disabled={gameState.disabled}>
                <div className="button-inner">
                  <span className="icon icon-attack"></span>
                  <span className="button-text">Attack</span>
                </div>
              </button>&nbsp;
              
              <button className="button-defend" onClick={defend} disabled={gameState.disabled}><div className="button-inner"><span className="icon icon-defend"></span><span className="button-text">Defend</span></div></button>&nbsp;
              
              <button className="button-heal" onClick={heal} disabled={gameState.disabled}><div className="button-inner"><span className="icon icon-heal"></span>
              <span className="button-text">Heal</span>
              </div></button>
            </div>
          </>
        }
                
        {taunts.selectedTaunt && 
          <Dialog taunt={taunts.selectedTaunt} name={playerCharacter.name["name-USen"]} textColor={playerCharacter["text-color"]} bubbleColor={playerCharacter["bubble-color"]}/>  
        }

      </div>
      
      <div className="no-mans-land col-span-1">
        <div className="knock-out-wrapper">
          KO
        </div>
      </div>

      <div className="enemy-character-wrapper col-span-5">
        {enemyCharacter && enemyCharacter.name && enemyCharacter.image_uri &&
          <Character char={enemyCharacter} textColor={enemyCharacter["text-color"]} bubbleColor={enemyCharacter["bubble-color"]}/>
        }
      </div>
      

      </div>
      </main>
      <footer className="wood-texture vertically-centered">A DIY project from Kevin McGuire</footer>
    </div>
  );
}

export default App;
