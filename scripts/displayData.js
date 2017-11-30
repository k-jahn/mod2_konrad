
// define class for data handling
function DataHandler() {

    // DataHandler properties

    this.raw = {};
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
            if (!$('#filter' + member.show('party')).is(":checked")) continue
            if ($('#filterStates')[0].value && $('#filterStates')[0].value != member.show('state')) continue
            //build row
            var row = $('<tr>');
            var columns= $('#dataDisplay th')
            for (var i=0; i<columns.length;i++){
                var content=member.show(columns[i].dataset.key,columns[i].dataset.format)
                row.append(
                    $('<td>').html(content)
                );
            }
            //push row to element array
            rowArr.push(row);
        }
        //clear tbody and insert row array
        $('#dataDisplay tbody').html('')
            .append(rowArr);
    };

    // format memberlist as instances of Politicans
    this.formatMembers = function() {
        for (var i in this.members) {
           this.members[i] = new Politician(this.members[i]);
           this.members[i].init();
        }
    }

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
        $.getJSON('data/proPublica/' + this.congress + '/' + this.chamber + '.json', function(data) {
            console.log('members.json loaded')
            that.raw=data;
            that.members = that.raw.results[0].members;
            that.formatMembers();
            that.displayMembers();
        });
    };

    // init(), sets needed values&calls fetches
    this.init = function() {
        //get url.params - overkill, but extendable
        var urlPars = {}
        document.URL.replace(
            /([^?&=#]+)=([^&=#]+)/g,
            (a, b, c) => {
                urlPars[b] = c;
            }
        )
        //assign values
        this.chamber = $('body').data('chamber');
        this.congress = urlPars.congress || 113;
        this.fetchStates();
        this.fetchMembers();
    }
}

// define class Politician
function Politician(data) {
    //store json data
    this.data=data; 

    // method that returns formatted data 
    this.show=function(key,format){ 
        var that=this;
        switch (format || 'plain') {
            case 'plain':
                return that.data[key];
            case 'percent':
                return that.data[key].toFixed(1)+'%';
            case 'linkUrl':
                return '<a href="'+that.data.url +'" target="_blank">'+that.data[key] +'<a>'
        }
    }
    // initialize politician, setting full_name
    this.init = function(){
        var name = [this.data.first_name]; // build full name
        if (this.data.middle_name) name.push(this.data.middle_name);
        name.push(this.data.last_name);
        this.data.full_name=name.join(' '); //set full name
    }
}

// create an instance of DataHandler
var d = new DataHandler();

// initialize it
d.init();

// set .change() event listener on <input> and <select> which redraws the table.
$('input, select').change(() => d.displayMembers())