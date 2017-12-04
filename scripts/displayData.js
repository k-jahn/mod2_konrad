// define class for data handling
function DataHandler() {

    // DataHandler properties

    this.raw = {};
    this.chamber = ''; //the chamber in question, taken from html
    this.congress = ''; //the congress in question, taken from html
    this.members = []; //members list, filled with json data
    this.states = []; //the states list. filled with json data

    // DataHandler Methods

    //searches document for tables to display data, calls appropriate methods
    this.displayHandler = function() {
        var that = this
        $('.memberTable').each(function() {
            that.displayMembers($(this))
        })
    }

    // display function to build the states dropdown
    this.displayStates = function() {
        var optionArr = []
        this.states.forEach(x => {
            optionArr.push(
                $('<option>').text(x.name + " : " + x.code).attr('value', x.code)
            );
        })
        $('#filterStates').append(optionArr)
    }

    // display function to build the table
    this.displayMembers = function(table) {
        //empty array for built rows
        var rowArr = [];
        //filter members who should appear in table
        var tableMembers = this.filterMembers(this.members,table)
        //sort members
        var tableMembers = this.sortMembers(tableMembers)
        // get data columns
        var columns = table.find('th')
        //loop to build individual rows and push them to rowArr
        for (var member of tableMembers) {
            //build row
            var row = $('<tr>');
            for (var i = 0; i < columns.length; i++) {
                var content = member.show(columns[i].dataset.key, columns[i].dataset.format)
                row.append(
                    $('<td>').html(content)
                );
            }
            //push row to element array
            rowArr.push(row);
        }
        //clear tbody and insert row array
        table.find('tbody').html('')
            .append(rowArr);
    };

    // filter members array before display in table
    this.filterMembers = function(members,table) {
        //get values from inputs, if present
        if (table.data('filter')=='userInput'){
            var party = {
                'D': $('#filterD').is(":checked"),
                'R': $('#filterR').is(":checked"),
                'I': $('#filterI').is(":checked")
            }
            var state = $('#filterStates')[0].value || false;
            return members.filter((member) => party[member.show('party')])
                .filter((member) => !state || state == member.show('state'))
        }
        return members
    }

    // sort members array before display in table
    this.sortMembers = function(members) {
        return members
    }

    // sets this.members as array of initialized Politicans
    this.formatMembers = function(members) {
        for (var i in members) {
            members[i] = new Politician(members[i]);
            members[i].init();
        }
        this.members = members
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
            that.raw = data;
            that.formatMembers(that.raw.results[0].members);
            that.displayHandler();
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
    this.data = data;

    // method that returns formatted data 
    this.show = function(key, format) {
        var that = this;
        switch (format || 'plain') {
            case 'plain':
                return that.data[key];
            case 'percent':
                return that.data[key].toFixed(1) + '%';
            case 'linkUrl':
                return '<a href="' + that.data.url + '" target="_blank">' + that.data[key] + '<a>'
        }
    }

    // initialize politician, setting full_name
    this.init = function() {
        var name = [this.data.first_name]; // build full name
        if (this.data.middle_name) name.push(this.data.middle_name);
        name.push(this.data.last_name);
        this.data.full_name = name.join(' '); //set full name
    }
}

// create an instance of DataHandler
var d = new DataHandler();
$(function() {
    // initialize it
    d.init();

    // set .change() event listener on <input> and <select> which redraws the table.
    $('input, select').change(() => d.displayHandler())
})