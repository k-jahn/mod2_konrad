function PageBuilder () {
	this.insertHeader = function() {
		$('header').load('pageModules/header.html',function(){
			//set active states to show current page
			var page = $('body').data('page');
			var chamber= $('body').data('chamber') || false;
			$('#'+page).addClass('active')
			if (chamber) $('#'+page+' .'+chamber).addClass('active')
			// get congress from cookie (if present)
			var find = /congress=(\d+)/
			var congress = find.test(document.cookie)?document.cookie.match(find)[1]:115
			$(this).find("#selectCongress")
				// display currently active congress
				.val(congress)
				.change()
				// on change, set cookie and reload 
				.on('change',function(){
					document.cookie=('congress='+$(this).val()+';')
					location.reload(false)
			})
		})	
	}
	this.insertFooter=function() {
		$('footer').load('pageModules/footer.html')
	}
}

var p = new PageBuilder()
$(function(){
	//load header
	p.insertHeader()
	// load footer
	p.insertFooter()
})