const Dialog = (props) => {
	const speechBubbleNameStyle = {
		clipPath: "url('#bean')",
		backgroundColor: props.bubbleColor,
		color: props.textColor,
	}
	const speechBubbleStyle = {
		clipPath: "url('#bread')"
	}
	return (
		<div className="speech-bubble-wrapper-wrapper">
			<div className="speech-bubble-wrapper">
				<div className="name" style={speechBubbleNameStyle}>{props.name}</div>
				<div className="speech-bubble" style={speechBubbleStyle}>
					<div className="content">
						{props.taunt}
					</div>
				</div>
			</div>
		</div>
	)
}

export default Dialog