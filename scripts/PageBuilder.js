// PageBuilder Class, inserts and binds header and footer
function PageBuilder (congress,chamber,page) {
	this.congress=congress;
	this.page=page;
	this.chamber= chamber || false;
	this.insertHeader = function() {
		var that=this;
		var callback = function() {
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
		}
		var headerUrl='pageModules/header.html';
		var headerHtml=localStorage.getItem(headerUrl) || false;
		if (headerHtml) {
			console.log('inserting header from localStorage')
			$('header').html(headerHtml).promise().done(callback)
		} else {
			console.log('loading header from server, saving to localStorage')
			$('header').load(headerUrl,function(data){
				localStorage.setItem(headerUrl,data)
				callback()
			})
		}	
	}
	this.insertFooter=function() {
		var footerUrl='pageModules/footer.html';
		var footerHtml=localStorage.getItem(footerUrl) || false;
		if (footerHtml) {
			console.log('inserting footer from localStorage')
			$('footer').html(footerHtml)
		} else {
			console.log('loading footer from server, saving to localStorage')
			$('footer').load(footerUrl,function(data){
				localStorage.setItem(footerUrl,data)
			})
		}
	}
}
