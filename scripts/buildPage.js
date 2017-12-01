console.log('inserting header and footer from file')
$(function(){
	//load header
	$('header').load('pageModules/header.html',function(){
		//set active states
		var page = $('body').data('page');
		var chamber= $('body').data('chamber') || false;
		$('#'+page).addClass('active')
		if (chamber) $('#'+page+' .'+chamber).addClass('active')
	})
	// load footer
	$('footer').load('pageModules/footer.html')
})