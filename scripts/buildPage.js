function PageBuilder () {
	this.insertHeader = function() {
		$('header').load('pageModules/header.html',function(){
			//set active states
			var page = $('body').data('page');
			var chamber= $('body').data('chamber') || false;
			$('#'+page).addClass('active')
			if (chamber) $('#'+page+' .'+chamber).addClass('active')
			// set congress
			var find = /congress=(\d+)/
			var congress = find.test(document.cookie)?document.cookie.match(find)[1]:115
			$(this).find("#selectCongress")
				.val(congress)
				.change()
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