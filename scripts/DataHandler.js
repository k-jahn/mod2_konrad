
// define class for data handling
function DataHandler(congress,chamber,localStoreExpires) {
    // DataHandler properties
    this.congress = congress;
    this.chamber = chamber; 
    this.localStoreExpires = localStoreExpires
    
    this.members = []; //members list, filled with json data
    this.states = []; //the states list. filled with json data
    this.filterStatus = { // set intitial user filter values

        'D': true,
        'R': true,
        'I': true,
        'state': ""
    }
    this.searchHitTable = []; // lookuptable for search hits

    // DataHandler Methods
    // init - redundant - mb remove?
    this.init = function() {
        this.loadMembers();
    }
    
    // fetch members.json and call displayMembers
    this.loadMembers = function() {
        var that=this;
        // build jsonURL
        var jsonURL='data/proPublica/' + this.congress + '/' + this.chamber + '.json'
        // callback for when data has been loaded
        var callback = function(data){
            // sets this.members as array of initialized Politicans
            for (var i in data.results[0].members) {
                that.members.push(new Politician(data.results[0].members[i],that));
                that.members[i].init();
            }
            that.initDisplay();
        }
        // check local storage for data
        JSON.localStorageManager(jsonURL,callback,this.localStoreExpires)
    };
    
    // fetch states.json and call displayStates
    this.fetchStates = function() {
        var that=this;
        var callback = function(data) {
            that.states=data;
            that.displayStates()
        };
        JSON.localStorageManager('data/states.json',callback,this.localStoreExpires)
    };

    //searches document for tables to display data, calls appropriate methods
    this.initDisplay = function() {
        var that = this
        // find member tables
        $('.memberTable').each(function() {
            // if table filterable by user input, call f() on it to add and bind interface elements
            if ($(this).data('filter')=="userInput") {
                that.initUserInput($(this))
            }
            // if sortable, call f() to add and bind interface elements
            if ($(this).hasClass('sortable')){
                that.initSort($(this))
            }
            // draw the actual table
            that.displayMembers($(this))
        })
        // find stats tables ...
        $('.statsTable').each(function() {
            // ...and draw them
            that.displayStats($(this))
        })
    }

    //creates and binds table sort inputs
    this.initSort = function(table) {
        console.log('initializing sort & search functionality')
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
        var that = this;
        console.log('initializing adjustable filter interface')
        //set searchServer
        //insert html for filter inputs
        table.before($('<div>').addClass('filterContainer').load('pageModules/filterInterface.html',function(){
            // get and display the states list for the select dropdown
            that.fetchStates();
            // set .change() event listener on <input> and <select> which stores value redraws the table.
            $(this).find('input[type="checkbox"]').change(function(){
                // store usr input
                that.filterStatus[$(this).data('filtername')]=$(this).is(":checked"),
                console.log('assigned '+that.filterStatus[$(this).data('filtername')]+' to filterStatus.' +$(this).data('filtername'))
                // redraw table
                that.displayMembers(table)
            })
            $(this).find('select').change(function(){
                // store usr input
                that.filterStatus[$(this).data('filtername')]=$(this).val(),
                console.log('assigned '+that.filterStatus[$(this).data('filtername')]+' to filterStatus.' +$(this).data('filtername'))
                // redraw table
                that.displayMembers(table)
            })
            $(this).find('input[type="text"]').on('keyup',function(){ 
                //sanitize and store user input
                that.filterStatus[$(this).data('filtername')]=$(this).val()
                    .replace(/[^A-Za-z0-9. ]/g,"")
                    .replace(/\./g,"\\.");
                console.log('assigned '+that.filterStatus[$(this).data('filtername')]+' to filterStatus.' +$(this).data('filtername'))
                // redraw table
                that.displayMembers(table)
            })
        }))
    }

    // display function to build the table
    this.displayMembers = function(table) {
        //empty array for built rows
        var rowArr = [];
        //clone members
        var tableMembers=this.members

        //filter members who should appear in table
        tableMembers = this.filterMembers(tableMembers,table)
        console.log('filtering: '+this.members.length+ ' returning: ' +tableMembers.length)
        //sort members
        tableMembers = this.sortMembers(tableMembers,table)
        // get data columns
        var columns = table.find('th')
        //loop to build individual rows and push them to rowArr
        for (var member of tableMembers) {
            //build row
            var row = $('<tr>');
            for (var i = 0; i < columns.length; i++) {
                var content = member.show(columns[i].dataset.key, columns[i].dataset.format)
                row.append(
                    $('<td>').append(content)
                );
            }
            if (table.hasClass('partyColor')) {
                row.addClass('rowColor'+member.show('party'))
            }

            //push row to element array
            rowArr.push(row);
        }
        //clear tbody and insert row array
        table.find('tbody').html('')
            .append(rowArr);
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
                        // if no value present or member did not vote, skip
                        if (isNaN(x.show($(this).data("key")))||x.show('total_votes')==0) continue
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
        $('#statesSelect').append(optionArr)
    }

    // filter members array before display in table
    this.filterMembers = function(members,table) {
        var that=this;
        //filter from inputs
        if (table.data('filter')=='userInput'){
            var that=this
            var search = this.filterStatus.search? new RegExp(this.filterStatus.search,'ig'):false;
            // clear search hits
            this.searchHitTable=[]
            if (search){
                console.log('table search filter active')
                //only searching full name atm 
                var searchFields = ['full_name']
            }
            // actual filter
            return members.filter(function(member){
                // check party
                if (!that.filterStatus[member.show('party')]) return false
                // check state
                if (that.filterStatus.state && that.filterStatus.state != member.show('state')) return false
                // check if search field is in use (expensive!)
                if (search){
                    //clear hit table
                    var hide = true
                    // go through search fields
                    for (var key of searchFields) {
                        //don't search parties (theres a checkbox :)
                        if (key=='party') continue
                        if (search.test(member.show(key).toString())) {
                            hide=false
                            // save match to lookup table
                            let entry = {'id':member.show('id')}
                            entry[key]= member.show(key).toString().replace(search,(x)=>'<span class="searchHit">'+x+'</span>')
                            that.searchHitTable.push(entry)
                        }
                    }
                    if (hide) return false
                }
                // and if no filter kicked the member out...
                return true
            })
        }
        //custom top/bot loy/attend filters
        //crawler function to find 10%+
        function crawl(list,key){
            var n=Math.round(list.length*0.1)-1
            while(list[n+1].show(key)==list[n].show(key)){
                n++
            }
            return list.slice(0,n+1)
        }
        // filters
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
        // exclude empty memberlists
        if (members.length==0) return [];
        // get sort parameters from table
        var sortKey=table.data('sortkey') || false;
        var sortNeg=table.data('sortneg') || false;
        // check if string or number and sort accordingly
        if (isNaN(members[0].show(sortKey))){
            members.sort((a,b)=>a.show(sortKey)<b.show(sortKey)?-1:1)
        } else {
            members.sort((a,b)=>+a.show(sortKey)-b.show(sortKey))
        }
        // check if sort is reversed
        if (sortNeg) members.reverse()
        return members
    }
}

