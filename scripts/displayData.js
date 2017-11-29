// define class for data handling
function DataHandler() {

    // DataHndler properties
    
    this.chamber = ''; //the chamber in question, taken from html
    this.congress = ''; //the congress in question, taken from html
    this.members = []; //members list, filled with json data
    this.states = []; //the states list. filled with json data

    // DataHandler Methods

    // display function to build the states dropdown
    this.displayStates = function() {
        var optionArr = []
        this.states.forEach(x => {
            optionArr.push(
                $('<option>').text(x.code + " : " + x.name).attr('value', x.code)
            );
        })
        $('#filterStates').append(optionArr)
    }

    // display function to build the table
    this.displayMembers = function() {
        var rowArr = [];
        //loop to build individual rows and push them to rowArr
        for (var member of this.members) {
            //check for filters
            if (!$('#filter' + member.party).is(":checked")) continue
            if ($('#filterStates')[0].value && $('#filterStates')[0].value != member.state) continue
            //build row
            var row = $('<tr>');
            var name = [member.first_name]; // build full name
            if (member.middle_name) name.push(member.middle_name);
            name.push(member.last_name);
            name = $('<a>').text(name.join(' ')).attr('href', member.url); //stick it inside a link
            row.append($('<td>').append(name)); //list of row elements
            var x = [
                member.party,
                member.state,
                member.seniority,
                member.votes_with_party_pct + "%"
            ];
            for (var i in x) {
                row.append($('<td>').text(x[i]));
            }
            //push row to element array
            rowArr.push(row);
        }
        //clear tbody and insert row array
        $('#dataDisplay tbody').html('');
        $('#dataDisplay tbody').append(rowArr);
    };

    // fetch states.json and call displayStates
    this.fetchStates = function() {
        var that = this;
        $.getJSON('data/states.json', function(data) {
            console.log('states.json loaded')
            that.states = data;
            that.displayStates();
        });
    };

    // fetch members.json and call displayMembers
    this.fetchMembers = function() {
        var that = this;
        $.getJSON('data/proPublica/' + this.congress + '/' +this.chamber + '.json', function(data) {
            console.log('members.json loaded')
            that.members = data.results[0].members;
            that.displayMembers();
        });
    };

    // init(), sets needed values&calls fetches
    this.init = function() {
    	//get url.params - overkill, but extendable
    	var urlPars={}
    	document.URL.replace(
    		/([^?&=#]+)=([^&=#]+)/g,
    		(a,b,c)=>{
    			urlPars[b]=c;
    		}
    	)
    	//assign values
        this.chamber = $('body').data('chamber');
        this.congress = urlPars.congress || 113;
        this.fetchStates();
        this.fetchMembers();
    }
}


// create an instance of DataHandler
var d = new DataHandler();

// initialize it
d.init();

// set .change() event listener on <input> and <select> which redraws the table.
$('input, select').change(()=>d.displayMembers())