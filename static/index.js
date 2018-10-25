$(function() {
	try {
		var typed = new Typed('#typed-index', {
			strings: ["Write anything down."],
			typeSpeed: 25,
			onComplete: function() {
				$('#appearaftertype').css('opacity', '1')
				$('#appearaftertype').addClass('appear')
			}
		});
	} catch(err) {}

	$('.pageContent').html(markdown.toHTML($('.pageContent').text()))
})