

//wait for DOM
$(function(){
	// get congress from cookie
	let test=/congress=(\d+)/
	var congress = test.test(document.cookie)?document.cookie.match(test)[1]:115
	// get page and chamber from html
	var page = $('body').data('page');
	var chamber = $('body').data('chamber') || false;
	// set localStoreExpiry
	var localStoreExpires= 60*10*1000
	// create global instances of PageBuilder and DataHandler
	window.d = new DataHandler(congress,chamber,localStoreExpires);
	window.p = new PageBuilder(congress,chamber,page)
	// load header
	p.insertHeader()
	// load footer
	p.insertFooter()
	// start datahandler
	d.init()
})