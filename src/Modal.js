const Modal = (props) => {
	return (
		<>
	    	<div className="modal absolute w-full h-full top-0 left-0 flex items-center justify-center">
				<div className="modal-overlay absolute w-full h-full bg-black opacity-25 top-0 left-0 cursor-pointer"></div>
				<div className="absolute md:w-1/2  bg-white rounded shadow-lg items-center justify-center text-center z-10 p-5">
			    	<p className="text-2xl"><span className="text-blue-400 font-bold">{props.messageTextTitle}</span></p>
			    	<div>
						<p className="text-xl text-green-400">{props.messageTextBody}</p>
						<button className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-6 my-4 text-xl rounded" onClick={props.buttonAction}>{props.buttonText}</button>
			  		</div>
				</div>
		    </div>
		</>
	)
}

export default Modal