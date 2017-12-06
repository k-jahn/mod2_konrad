// define class for data handling
function DataHandler() {
    // DataHandler properties
    this.raw = {};
    this.chamber = ''; //the chamber in question, taken from html
    this.congress = ''; //the congress in question, taken from html
    this.members = []; //members list, filled with json data
    this.states = []; //the states list. filled with json data

    // DataHandler Methods

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
        //call fetch functions
        this.fetchMembers();
        //build table sortSearch
        var that=this;
    }
    
    // fetch members.json and call displayMembers
    this.fetchMembers = function() {
        var that = this;
        $.getJSON('data/proPublica/' + this.congress + '/' + this.chamber + '.json', function(data) {
            console.log('members.json loaded')
            that.raw = data;
            that.formatMembers(that.raw.results[0].members);
            that.initDisplay();
        });
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

    //searches document for tables to display data, calls appropriate methods
    this.initDisplay = function() {
        var that = this
        $('.memberTable').each(function() {
            if ($(this).data('filter')=="userInput") {
                that.initUserInput($(this))
            }
            if ($(this).hasClass('sortable')){
                that.initSort($(this))
            }
            that.displayMembers($(this))
        })
        $('.statsTable').each(function() {
            that.displayStats($(this))
        })
    }

    //creates and binds table sort inputs
    this.initSort = function(table) {
        console.log('initializing sort & search functionality for'+ this)
        var that=this
        //callback function
        function callback(){
            // break if active
            if ($(this).hasClass('active')) return
            //remove previous active, set current
            $('.sortIcon.active').removeClass('active');
            $(this).addClass('active');
            //set column key as table searchKey - if full_name => last name
            var sortKey=$(this).parent().data('key')=='full_name'?'last_name':$(this).parent().data('key');
            console.log(sortKey)
            table.data({'sortkey':sortKey,'sortneg':$(this).hasClass('reverse')?'true':''})
            that.displayMembers(table);
       }
        // build sort icons, bind callback
        var sortDown =  $('<span>')
            .addClass('glyphicon glyphicon-chevron-down sortIcon')
            .on('click',callback)
        var sortUp = $('<span>')
            .addClass('glyphicon glyphicon-chevron-up sortIcon reverse')
            .on('click',callback)
        // append sortIcons to header
        table.find('th').append([sortDown,sortUp])
        // show first option as active
        table.find('span').first().addClass('active')
    }

    //binds user-adjustable filter inputs
    this.initUserInput = function(table){
        console.log('initializing user input filter functionality')
        // get (and call display) the states list for the select dropdown
        this.fetchStates();
        // set .change() event listener on <input> and <select> which redraws the table.
        $('input[type="checkbox"], select').change(() => this.displayMembers(table))
        $('input[type="text"]').on('keyup',() => this.displayMembers(table))
    }

    // display function to build the table
    this.displayMembers = function(table) {
        //empty array for built rows
        var rowArr = [];
        //filter members who should appear in table
        console.log('filtering ' +this.members.length)
        var tableMembers = this.filterMembers(this.members,table)
        console.log('returning ' +tableMembers.length)
        //sort members
        var tableMembers = this.sortMembers(tableMembers,table)
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
        //colorboxerize(tm) it - mb move to politician?
        table.find('a').each(function(i,link){
            $(link).colorbox({iframe:true, width:"80%", height:"80%"});
        })
    };

    // diplay function to build stats table
    this.displayStats=function(table){
        var that=this;
        table.find('.statsField').each(function(){
            if ($(this).data("key")) {
                var sum=0
                var n=0
                for (x of that.members){
                    if (x.show('party')==$(this).data("party")){
                        sum+= +x.show($(this).data("key"))
                        n++
                    }
                }
                if (n==0) $(this).html('--')
                else $(this).html((sum/n).toFixed(1) + '%')
            } else {
                //display # of members
                var n=0
                for (x of that.members) {
                    if (x.show('party')==$(this).data("party")) n++
                }
                $(this).html(n)
            }
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

    // filter members array before display in table
    this.filterMembers = function(members,table) {
        //filter from inputs
        if (table.data('filter')=='userInput'){
            var party = {
                'D': $('#filterD').is(":checked"),
                'R': $('#filterR').is(":checked"),
                'I': $('#filterI').is(":checked")
            }
            var state = $('#filterStates').first().val();
            var search = $('#filterSearch').first().val();
            search = search? new RegExp(search,'i'):false;
            if (search) console.log('table search filter active')
            return members.filter(function(member){
                if (!party[member.show('party')]) return false
                if (state && state != member.show('state')) return false
                if (search){
                    var hide = true
                    //ugly... repeating myself - select fields to search in
                    var searchFields = table
                        .find('th')
                        .map(function(){return $(this).data('key')})
                    for (var key of searchFields) {
                        if (member.show(key).toString().match(search)) {
                            hide=false
                            break;
                        }
                    }
                    if (hide) return false
                }
                return true
            })
        }
        //custom top/bot loy/attend filters
        //crawler function to find 10%+
        function crawl(list,key){
            var n=Math.round(list.length*0.1)-1
            while(list[n+1].show(key)==list[n].show(key))n++
            return list.slice(0,n)
        }

        if (table.data('filter')=='extremeLoyalty'){
            var sortedMembers=this.sortMembers(members.filter((x)=>x.show('total_votes')!=0),table)
            return crawl(sortedMembers,"votes_with_party_pct")
        }
        if (table.data('filter')=='extremeAttendance'){
            var sortedMembers=this.sortMembers(members.filter((x)=>x.show('total_votes')!=0),table)
            return crawl(sortedMembers,"missed_votes_pct")
        }
        return members
    }

    // sort members array before display in table
    this.sortMembers = function(members,table) {
        if (members.length==0) return [];
        var sortKey=table.data('sortkey') || false;
        var sortNeg=table.data('sortneg') || false;
        var sortedMembers=members
        console.log('sort function on, sorting by: ' +sortKey +' reversed: '+sortNeg)
        
        if (!isNaN(members[0].show(sortKey))){
            sortedMembers.sort((a,b)=>a.show(sortKey)-b.show(sortKey))
        } else {
            sortedMembers.sort((a,b)=>a.show(sortKey)<b.show(sortKey)?-1:1)
        }
        if (sortNeg) sortedMembers=sortedMembers.reverse()
        return sortedMembers
    }

    // sets this.members as array of initialized Politicans
    this.formatMembers = function(members) {
        for (var i in members) {
            this.members.push(new Politician(members[i]));
            this.members[i].init();
        }
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
                return '<a href="' + that.data.url + '">' + that.data[key] + '<a>'
        }
    }
    // initialize, calculate additional values
    this.init = function() {
        //set full_name
        var name = [this.data.first_name];
        if (this.data.middle_name) name.push(this.data.middle_name);
        name.push(this.data.last_name);
        this.data.full_name = name.join(' '); 
        //set party_votes
        this.data.party_votes=Math.round(this.data.total_votes*this.data.votes_with_party_pct/100);
    }
}

// create an instance of DataHandler
var d = new DataHandler();
$(function() {
    // initialize it
    d.init();
    
})