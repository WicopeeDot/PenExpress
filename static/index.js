var typed = new Typed('#typed', {
	strings: ["Write anything down."],
	typeSpeed: 25,
	onComplete: function() {
		$('#appearaftertype').css('opacity', '1')
		$('#appearaftertype').addClass('appear')
	}
});