const Character = (props) => {
	
	const speechBubbleNameStyle = {
		clipPath: "url('#bean')",
		backgroundColor: props.bubbleColor,
		color: props.textColor,
	}
	
	return (
		<>
		  <p className="player-name" style={speechBubbleNameStyle}> {props.char.name["name-USen"]} </p>
		  
		  <progress className="player-hp-meter" max={props.char.maxHitPoints} value={props.char.hitPoints}/>
		  
		  <ul>
		  	<li style={{display: 'none'}}>HP: {props.char.hitPoints}/{props.char.maxHitPoints}</li>
		  	<li style={{display: 'none'}}>AT: {props.char.power}/{props.char.defense}</li>
		  </ul>
		  
		  <div className="image-wrapper">
		    
		  <img className="w-64 mx-auto" src={props.char.icon_uri} alt={props.char.name["name-USen"]}/>
		
		  </div>
		  
		  <div className="player-action-buttons">
		  	{props.char.action === "attack" && 
			  <button className="button-attack">
			  	<div className="button-inner">
			  		<span aria-label="attack" className="icon icon-attack"></span>
				</div>
			  </button>
			}
		  
		  	{props.char.action === "defend" && 
			  <button className="button-defend">
					<div className="button-inner">
			    		<span aria-label="defend" className="icon icon-defend"></span>
			  		</div>
			  </button>
			}
			
			{props.char.action === "nothing" && 
				<button className="button-nothing">
					<div className="button-inner">
			  	  		<span aria-label="nothing" className="icon icon-nothing"></span>
			  		</div>
				</button>
			}
			</div>
		</>
	)
}

export default Character