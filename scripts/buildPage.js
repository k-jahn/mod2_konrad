console.log('inserting header and footer from file')
$(function(){
	//load header
	$('header').load('pageModules/header.html',function(){
		//set active states
		var page = $('body').data('page');
		var chamber= $('body').data('chamber') || false;
		$('#'+page).addClass('active')
		if (chamber) $('#'+page+' .'+chamber).addClass('active')
		// set congress
		var congress = document.cookie.match(/congress=(\d+)/)[1] || 115
		console.log(congress)
		$(this).find("#selectCongress")
			.val(congress)
			.change()
			.on('change',function(){
				document.cookie=('congress='+$(this).val()+';')
				location.reload(false)
		})
	})
	// load footer
	$('footer').load('pageModules/footer.html')
})