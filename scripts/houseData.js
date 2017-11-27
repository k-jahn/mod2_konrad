console.log('loading script for senate data')
function dispData(data){
	for (var i in data) {
		var row="<tr><td>" //build row string for each member
				+'<a href="'
				+data[i].url
				+'" target="_blank">'
				+data[i].first_name
				+" "
		if (data[i].middle_name){
			row+=data[i].middle_name 
				+" "
		}
		row+=data[i].last_name
				+'</a>'
				+"</td><td>"
				+data[i].party
				+"</td><td>"
				+data[i].state
				+"</td><td>"
				+data[i].seniority
				+"</td><td>"
				+data[i].votes_with_party_pct+"%"
				+"</td></tr>"
		$('#dataDisplay').append(row)
	}
}

$(function(){
	dispData(houseData.results[0].members)
})