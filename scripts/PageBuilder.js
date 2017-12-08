// PageBuilder Class, inserts and binds header and footer
function PageBuilder (congress,chamber,page) {
	this.congress=congress;
	this.page=page;
	this.chamber= chamber || false;
	this.insertHeader = function() {
		var that=this;
		$('header').load('pageModules/header.html',function(){
			//set active states to show current page
			$('#'+page).addClass('active')
			if (that.chamber) $('#'+that.page+' .'+that.chamber).addClass('active')
			$(this).find("#selectCongress")
				// display currently active congress
				.val(that.congress)
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
