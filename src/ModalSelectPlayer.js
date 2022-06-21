const ModalSelectPlayer = (props) => {
	return (
		<>
			<div className="modal absolute w-full h-full top-0 left-0 flex items-center justify-center">
				<div className="modal-overlay absolute w-full h-full bg-black opacity-25 top-0 left-0 cursor-pointer"></div>
				<div className="absolute md:w-1/2  bg-white rounded shadow-lg items-center justify-center text-center z-10 p-5">
					<p className="text-2xl"><span className="text-blue-400 font-bold">{props.messageTextTitle}</span></p>
					
					<div className="button-group-player-select">
					{props.startingCharacters.map((sc) =>             
						<button className="button-default" key={sc.id} onClick={()=>{props.initPlayer(sc)}}>
							<div className="button-inner">
							<img className="inline-block" src={sc.icon_uri} width="50"/>
							{sc.name["name-USen"]}
							</div>
						</button>  
				  	)}
					</div>
				</div>
			</div>
		</>
	)
}

export default ModalSelectPlayer